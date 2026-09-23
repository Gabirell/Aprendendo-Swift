import { MockExam } from '../data/mockExamsData';

export interface ParsedRevisionNote {
  topic: string;
  content: string;
  keyPoints?: string[];
}

export interface ParsedExamResult {
  exam: MockExam;
  rawNotes: ParsedRevisionNote[];
  totalQuestions: number;
}

/**
 * Intelligent client-side HTML parser for 'swift-revisao-simulado.html'
 * and any other iOS Lab revision / quiz files.
 */
export function parseHtmlSimulado(htmlContent: string, fileName: string = 'swift-revisao-simulado.html'): ParsedExamResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  // 1. Extract Title
  let title = doc.querySelector('title')?.textContent?.trim() ||
              doc.querySelector('h1')?.textContent?.trim() ||
              doc.querySelector('.title, .titulo, #title, #titulo')?.textContent?.trim() ||
              'Simulado & Revisão iOS Lab';

  // Clean up title
  if (!title || title.length < 3) {
    title = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  }

  // 2. Extract Description / Subtitle
  let description = doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() ||
                    doc.querySelector('.description, .descricao, .subtitle, .subtitulo, p.lead')?.textContent?.trim() ||
                    'Material de revisão e questões importadas do iOS Lab.';

  // 3. Extract Questions
  const questions: MockExam['questions'] = [];
  const revisionNotes: ParsedRevisionNote[] = [];

  // Look for Gabarito mapping first (e.g. "1: B", "1 - A", "1. C", "Gabarito: 1-A, 2-B")
  const gabaritoMap: Record<number, number> = {};
  const textContent = doc.body ? doc.body.textContent || '' : '';
  
  // Regex to find gabarito table or string list: "1 - B" or "1. A" or "1: C" or "Q1: B"
  const gabaritoRegex = /(?:Questão|Q|)\s*([0-9]{1,3})\s*[:\-\)\.]\s*([A-Ea-e])\b/gi;
  let match: RegExpExecArray | null;
  while ((match = gabaritoRegex.exec(textContent)) !== null) {
    const qNum = parseInt(match[1], 10);
    const letter = match[2].toUpperCase();
    const idx = letter.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3, E=4
    if (idx >= 0 && idx <= 4) {
      gabaritoMap[qNum] = idx;
    }
  }

  // Find candidate question elements
  const questionSelectors = [
    '.question', '.questao', '.item-pergunta', '.card-questao',
    '.quiz-question', '[data-question]', '.simulado-item',
    'fieldset', '.question-container'
  ];

  let qElements = doc.querySelectorAll(questionSelectors.join(', '));

  // If no standard classes found, look for headings followed by lists or options
  if (qElements.length === 0) {
    const headings = doc.querySelectorAll('h2, h3, h4, p > strong');
    const potentialQuestionBlocks: Element[] = [];
    headings.forEach(h => {
      const text = h.textContent?.trim() || '';
      if (/^(quest[aã]o|pergunta|\d+[\.\-\)])/i.test(text)) {
        const parent = h.parentElement;
        if (parent && !potentialQuestionBlocks.includes(parent)) {
          potentialQuestionBlocks.push(parent);
        }
      }
    });
    if (potentialQuestionBlocks.length > 0) {
      qElements = potentialQuestionBlocks as unknown as NodeListOf<Element>;
    }
  }

  // Iterate over detected question blocks
  if (qElements.length > 0) {
    qElements.forEach((el, index) => {
      const qNum = index + 1;
      
      // Question text: check for heading, prompt, or first paragraph
      const qTitleEl = el.querySelector('h2, h3, h4, .prompt, .enunciado, .question-text, .titulo-questao, legend, strong');
      let questionText = qTitleEl?.textContent?.trim() || '';
      
      if (!questionText || questionText.length < 5) {
        // Fallback: get first non-empty text node or paragraph
        const p = el.querySelector('p');
        questionText = p?.textContent?.trim() || el.childNodes[0]?.textContent?.trim() || `Questão ${qNum}`;
      }

      // Clean prefix like "Questão 1:" or "1."
      questionText = questionText.replace(/^(Questão\s*\d+[:\-\.]?|\d+[\.\-\)]\s*)/i, '').trim();
      if (!questionText) questionText = `Questão ${qNum}`;

      // Options
      const options: string[] = [];
      let detectedCorrectIndex = -1;

      // Check radio inputs or labels
      const optionElements = el.querySelectorAll('li, .option, .opcao, .alternative, .alternativa, label, input[type="radio"]');
      
      optionElements.forEach((optEl, optIdx) => {
        let optText = '';
        let isCorrect = false;

        if (optEl.tagName.toLowerCase() === 'input') {
          const parent = optEl.parentElement;
          optText = parent?.textContent?.trim() || '';
          if (optEl.hasAttribute('checked') || optEl.getAttribute('data-correct') === 'true') {
            isCorrect = true;
          }
        } else {
          optText = optEl.textContent?.trim() || '';
          if (
            optEl.classList.contains('correct') || 
            optEl.classList.contains('correta') ||
            optEl.classList.contains('active') ||
            optEl.getAttribute('data-correct') === 'true' ||
            optEl.querySelector('input:checked') ||
            optEl.querySelector('.correct, .correta, [data-correct="true"]')
          ) {
            isCorrect = true;
          }
        }

        // Clean option prefix like "A)", "a.", "(A)", "[A]"
        optText = optText.replace(/^[a-eA-E][\)\.\:\-\]]\s*/, '').trim();

        if (optText.length > 0 && !options.includes(optText)) {
          options.push(optText);
          if (isCorrect && detectedCorrectIndex === -1) {
            detectedCorrectIndex = options.length - 1;
          }
        }
      });

      // If correct index not detected in DOM, check gabaritoMap
      if (detectedCorrectIndex === -1 && gabaritoMap[qNum] !== undefined) {
        const mappedIdx = gabaritoMap[qNum];
        if (mappedIdx < options.length) {
          detectedCorrectIndex = mappedIdx;
        }
      }

      // Default to 0 if still undetermined
      if (detectedCorrectIndex === -1) {
        detectedCorrectIndex = 0;
      }

      // Explanation / Justificativa
      const expEl = el.querySelector('.explanation, .explicacao, .justificativa, .comentario, .feedback, blockquote');
      const explanation = expEl?.textContent?.trim() || 
        'Conceito extraído do material de revisão do iOS Lab.';

      if (options.length >= 2) {
        questions.push({
          id: qNum,
          question: questionText,
          options: options.slice(0, 5),
          correctIndex: detectedCorrectIndex,
          explanation
        });
      }
    });
  }

  // 4. Extract Revision Notes / Resumos / Teoria
  const reviewSections = doc.querySelectorAll('section, article, .revisao, .resumo, .topico, .conteudo, .card');
  reviewSections.forEach((sec, idx) => {
    // Avoid sections that are solely quiz questions
    if (sec.querySelectorAll('.question, .questao, input[type="radio"]').length > 2) return;

    const topicHeading = sec.querySelector('h1, h2, h3, h4, h5, strong');
    const topic = topicHeading?.textContent?.trim() || `Tópico de Revisão ${idx + 1}`;
    
    // Key points (lists)
    const keyPoints: string[] = [];
    sec.querySelectorAll('li').forEach(li => {
      const txt = li.textContent?.trim();
      if (txt && txt.length > 5) keyPoints.push(txt);
    });

    // Content paragraphs
    const paragraphs: string[] = [];
    sec.querySelectorAll('p').forEach(p => {
      const txt = p.textContent?.trim();
      if (txt && txt.length > 10 && !txt.startsWith('Questão')) {
        paragraphs.push(txt);
      }
    });

    const content = paragraphs.join('\n\n') || sec.textContent?.trim().slice(0, 500) || '';
    if (content.length > 30 || keyPoints.length > 0) {
      revisionNotes.push({
        topic,
        content: content.slice(0, 1000),
        keyPoints: keyPoints.slice(0, 6)
      });
    }
  });

  // If no questions were found via selectors, try text regex parsing
  if (questions.length === 0) {
    const rawLines = textContent.split('\n').map(l => l.trim()).filter(Boolean);
    let currentQ: { question: string; options: string[]; explanation: string } | null = null;
    let autoId = 1;

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];
      // Check if line looks like question
      const qMatch = line.match(/^(?:Questão|Q|Pergunta)?\s*(\d+)[\.\:\-\)]\s*(.+)/i);
      if (qMatch) {
        if (currentQ && currentQ.options.length >= 2) {
          questions.push({
            id: autoId++,
            question: currentQ.question,
            options: currentQ.options,
            correctIndex: 0,
            explanation: currentQ.explanation || 'Revisão do iOS Lab'
          });
        }
        currentQ = {
          question: qMatch[2],
          options: [],
          explanation: ''
        };
        continue;
      }

      // Check if line is an option: "a) ...", "B. ...", "(c) ..."
      const optMatch = line.match(/^[\(\[]?([A-Ea-e])[\)\.\:\-\]]\s*(.+)/);
      if (optMatch && currentQ) {
        currentQ.options.push(optMatch[2]);
        continue;
      }

      // Check if explanation
      if (/^(explica[çc][aã]o|justificativa|coment[aá]rio):/i.test(line) && currentQ) {
        currentQ.explanation = line.replace(/^(explica[çc][aã]o|justificativa|coment[aá]rio):\s*/i, '');
      }
    }

    if (currentQ && currentQ.options.length >= 2) {
      questions.push({
        id: autoId++,
        question: currentQ.question,
        options: currentQ.options,
        correctIndex: 0,
        explanation: currentQ.explanation || 'Revisão do iOS Lab'
      });
    }
  }

  // Build final MockExam object
  const examId = `ioslab-import-${Date.now()}`;
  const exam: MockExam = {
    id: examId,
    title: title.slice(0, 60),
    description: description.slice(0, 180),
    category: 'Fundamentos',
    timeLimitMinutes: Math.max(10, Math.min(60, questions.length * 2.5)),
    questions,
    revisionNotes: revisionNotes.length > 0 ? revisionNotes : undefined
  };

  return {
    exam,
    rawNotes: revisionNotes,
    totalQuestions: questions.length
  };
}
