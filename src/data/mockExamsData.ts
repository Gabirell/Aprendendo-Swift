export interface RevisionTopic {
  topic: string;
  content: string;
  keyPoints?: string[];
  codeExample?: string;
}

export interface MockExam {
  id: string;
  title: string;
  description: string;
  category: 'Fundamentos' | 'iOS e iPadOS' | 'Full-Stack Apple' | 'iOS Lab / Simulado';
  timeLimitMinutes: number;
  questions: {
    id: number;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  revisionNotes?: RevisionTopic[];
  isCustomImported?: boolean;
}

export const mockExams: MockExam[] = [
  {
    id: 'exam-ioslab-revisao',
    title: 'Simulado & Revisão Geral: iOS LAB',
    description: 'Material completo do iOS Lab: 15 questões estruturadas com revisão teórica integrada cobrindo os pilares do ecossistema Apple, Swift 6 e boas práticas.',
    category: 'iOS Lab / Simulado',
    timeLimitMinutes: 45,
    questions: [
      {
        id: 1,
        question: 'Qual é a principal diferença conceitual e de alocação de memória entre uma Struct e uma Class em Swift?',
        options: [
          'Structs são alocadas na Heap e passadas por referência; Classes são alocadas na Stack e passadas por valor.',
          'Structs são Value Types (alocadas na Stack, copiadas por atribuição); Classes são Reference Types (alocadas na Heap, passadas por referência).',
          'Structs suportam herança múltipla, enquanto Classes suportam apenas herança simples.',
          'Classes são imutáveis por padrão, enquanto Structs sempre podem ter seus membros modificados sem mutating.'
        ],
        correctIndex: 1,
        explanation: 'Structs são Value Types (armazenadas na Stack, copiadas ao serem atribuídas ou passadas como parâmetro). Classes são Reference Types (armazenadas na Heap, e variáveis apontam para o mesmo endereço de memória).'
      },
      {
        id: 2,
        question: 'Como o ARC (Automatic Reference Counting) monitora a memória no Swift e qual é o principal risco de ciclos de retenção (Retain Cycles)?',
        options: [
          'O ARC usa um coletor de lixo que pausa a execução periodicamente; ciclos de retenção aumentam o tempo de compilação.',
          'O ARC incrementa e decrementa contadores de referências fortes em tempo de execução; se dois objetos tiverem referências fortes mútuas, eles nunca atingem 0 e nunca são liberados da memória.',
          'O ARC só gerencia Structs e Enums; Classes não precisam de gerenciamento de memória.',
          'O ARC desfaz closures automaticamente no momento em que elas saem do escopo da View.'
        ],
        correctIndex: 1,
        explanation: 'Quando duas instâncias de classes mantêm referências fortes (`strong`) uma para a outra, ou uma closure captura `self` fortemente, o contador de referências nunca chega a zero, provocando um vazamento de memória (Memory Leak).'
      },
      {
        id: 3,
        question: 'No tratamento de Optionals, qual é a principal vantagem de utilizar "guard let" em vez de "if let" dentro de uma função?',
        options: [
          'O guard let permite forçar o unwrap com ! sem risco de crash.',
          'O guard let garante "early exit" (saída antecipada) com return/throw e mantém a variável desempacotada acessível em todo o escopo subsequente.',
          'O guard let consome menos ciclos de clock no processador da Apple.',
          'O guard let só pode ser usado com tipos numéricos.'
        ],
        correctIndex: 1,
        explanation: '`guard let ... else { return }` previne aninhamentos excessivos (pyramid of doom) e garante que as variáveis desempacotadas fiquem no escopo de toda a função após a validação.'
      },
      {
        id: 4,
        question: 'Para evitar vazamento de memória ao capturar "self" dentro de uma closure assíncrona (ex: URLSession ou animação), qual lista de captura é recomendada?',
        options: [
          '[strong self]',
          '[weak self]',
          '[mutating self]',
          '[actor self]'
        ],
        correctIndex: 1,
        explanation: 'Usar `[weak self]` transforma a referência capturada em opcional (`self?`), evitando que a closure mantenha o objeto retido indefinidamente caso o ciclo de vida do controller ou view termine.'
      },
      {
        id: 5,
        question: 'Em SwiftUI, qual Property Wrapper deve ser utilizado para criar uma fonte da verdade local (Source of Truth) gerenciada exclusivamente pela própria View?',
        options: [
          '@Binding',
          '@ObservedObject',
          '@State',
          '@EnvironmentObject'
        ],
        correctIndex: 2,
        explanation: '@State é desenhado para estados locais e simples gerenciados pela própria View (geralmente tipos de valor como Bool, String, Int).'
      },
      {
        id: 6,
        question: 'Qual é o papel do modifier ".task" introduzido no SwiftUI em comparação com ".onAppear"?',
        options: [
          'Ele apenas desenha uma barra de progresso no topo da tela.',
          'Ele inicia uma Task assíncrona quando a View aparece e cancela a execução automaticamente caso a View seja destruída antes do término.',
          'Ele roda obrigatoriamente fora do app, em background no servidor iCloud.',
          'Ele substitui o init de Structs.'
        ],
        correctIndex: 1,
        explanation: '`.task` executa código assíncrono (async/await) com gerenciamento de ciclo de vida automático: se a View desaparecer antes da tarefa terminar, a Task é cancelada automaticamente.'
      },
      {
        id: 7,
        question: 'O que o operador de coalescência nula (??) realiza em Swift?',
        options: [
          'Ele compara se dois Optionals são idênticos em memória.',
          'Ele desempacota um Optional se houver valor, ou retorna um valor padrão fornecido caso seja nil.',
          'Ele lança um erro fatal imediatamente caso a variável seja nil.',
          'Ele converte automaticamente qualquer String para Int.'
        ],
        correctIndex: 1,
        explanation: 'Ex: `let name = optionalName ?? "Convidado"`. Se optionalName contiver um valor, ele é desempacotado; caso seja nil, "Convidado" é retornado.'
      },
      {
        id: 8,
        question: 'Ao projetar arquitetura de software no ecossistema Apple com o padrão MVVM, qual é a responsabilidade do ViewModel?',
        options: [
          'Gerenciar o Auto Layout, constraints visuais e renderizar pixels na tela.',
          'Manter a conexão direta com o banco de dados SQL nativo sem passar pela Model.',
          'Receber os dados brutos da Model, aplicar regras de negócio, formatar dados para a interface e expor propriedades observáveis para a View.',
          'Controlar a rota de transição de telas no AppDelegate.'
        ],
        correctIndex: 2,
        explanation: 'O ViewModel atua como mediador entre a Model e a View, separando regras de negócios e formatação do código estritamente visual da View.'
      },
      {
        id: 9,
        question: 'Qual é a diferença fundamental entre "weak" e "unowned" no gerenciamento de memória Swift?',
        options: [
          'weak pode se tornar nil e deve sempre ser declarado como var Optional; unowned assume que o objeto referenciado nunca será nil durante seu ciclo.',
          'unowned é alocado na stack, enquanto weak é alocado na heap.',
          'weak causa memory leaks se a classe for desalocada antes do esperado.',
          'Não há diferença técnica, são sinônimos criados para compatibilidade com Objective-C.'
        ],
        correctIndex: 0,
        explanation: '`weak` deve ser uma variável opcional (`var delegate: MyDelegate?`) pois é automaticamente zerada para `nil` quando o objeto referenciado é desalocado. `unowned` é não-opcional e provocará um crash fatal se acessado após a desalocação.'
      },
      {
        id: 10,
        question: 'Em Programação Orientada a Protocolos (POP) em Swift, como podemos fornecer uma implementação padrão para um método de um protocolo?',
        options: [
          'Criando uma classe abstrata com override.',
          'Escrevendo uma extension do protocolo contendo a implementação do método.',
          'Marcando o método como @optional na definição do protocolo.',
          'Usando a palavra-chave defaultMethod no corpo do protocolo.'
        ],
        correctIndex: 1,
        explanation: 'Através de extensões de protocolos (`extension MeuProtocolo { func acao() { ... } }`), qualquer tipo que adote o protocolo ganha a implementação padrão sem precisar reescrevê-la.'
      },
      {
        id: 11,
        question: 'Como a macro @Observable (introduzida no iOS 17 e Swift 5.9+) simplifica o gerenciamento de estado em relação a ObservableObject?',
        options: [
          'Exige que todas as propriedades usem @Published manualmente e classes herdem de NSObject.',
          'Rastreia acessos a propriedades automaticamente no nível de campos individuais, sem necessidade de @Published ou @ObservedObject.',
          'Substitui o UIKit inteiramente impedindo o uso de UIViewRepresentable.',
          'Funciona apenas para Structs e proíbe o uso de Classes.'
        ],
        correctIndex: 1,
        explanation: 'A macro `@Observable` elimina a necessidade de `@Published` e `@StateObject`, proporcionando maior performance e re-renderizando apenas as Views que dependem diretamente daquela propriedade alterada.'
      },
      {
        id: 12,
        question: 'Qual função de alta ordem (Higher-Order Function) deve ser usada para filtrar nils e converter elementos ao mesmo tempo em uma coleção?',
        options: [
          '.map',
          '.filter',
          '.compactMap',
          '.reduce'
        ],
        correctIndex: 2,
        explanation: '`.compactMap` aplica uma transformação em cada elemento e descarta automaticamente qualquer resultado que seja `nil`.'
      },
      {
        id: 13,
        question: 'No Swift Concurrency, o que um Actor garante que uma Class comum não garante?',
        options: [
          'Que ele pode ser copiado por valor como uma Struct.',
          'Proteção automática contra Data Races através de isolamento de estado e acesso serializado.',
          'Execução exclusiva na thread de renderização de interface gráfica (Main Thread).',
          'Alocação contínua de memória sem contagem de referências.'
        ],
        correctIndex: 1,
        explanation: 'Actors são Reference Types que protegem seu estado mutável contra acessos concorrentes simultâneos (Data Races), serializando chamadas via `await`.'
      },
      {
        id: 14,
        question: 'Qual é a forma correta de tratar exceções lançadas por uma função marcada com "throws" em Swift?',
        options: [
          'Usar bloco try/catch no estilo Java.',
          'Chamar com "try" dentro de um bloco "do { } catch { }", ou converter com "try?" para Optional.',
          'Definir um callback onException: (Error) -> Void.',
          'Toda função com throws deve ser envolvida em fatalError().'
        ],
        correctIndex: 1,
        explanation: 'Em Swift usamos `do { try funcao() } catch { print(error) }` ou `let resultado = try? funcao()` para transformar falhas em `nil` de forma segura.'
      },
      {
        id: 15,
        question: 'Qual é o papel do arquivo Info.plist em uma aplicação iOS?',
        options: [
          'Compilar os arquivos Swift em código de máquina ARM64.',
          'Armazenar chaves de configuração, metadados do app e descrições de permissões de privacidade do usuário (ex: Câmera, Localização).',
          'Salvar o progresso das variáveis globais entre inicializações do app.',
          'Definir as constraints de Auto Layout de forma binária.'
        ],
        correctIndex: 1,
        explanation: 'O Info.plist é uma lista de propriedades (Property List) que contém metadados vitais para o iOS, incluindo bundle identifier, versão, permissões (Usage Descriptions) e capacidades.'
      }
    ],
    revisionNotes: [
      {
        topic: '1. Structs vs Classes (Memory & Semantics)',
        content: 'No ecossistema Swift, priorizamos Structs (Value Types) para modelos de dados imutáveis e previsíveis. Structs são armazenadas na Stack, não sofrem com race conditions e não geram retain cycles. Classes (Reference Types) são reservadas para objetos com ciclo de vida único, identidade própria ou herança necessária.',
        keyPoints: [
          'Struct = Value Type, cópia profunda em atribuições, alocada na Stack.',
          'Class = Reference Type, múltiplas referências para mesma instância na Heap.',
          'Métodos de Struct que alteram propriedades exigem a palavra mutating.',
          'Classes possuem deinit() para limpeza; Structs não possuem deinit.'
        ],
        codeExample: 'struct User {\n  var name: String\n  mutating func rename(to newName: String) {\n    self.name = newName\n  }\n}'
      },
      {
        topic: '2. ARC & Prevenção de Retain Cycles',
        content: 'O gerenciador de memória do Swift (ARC) conta as referências fortes. O Retain Cycle clássico ocorre quando um objeto A segura uma referência forte para B, e B segura uma referência forte de volta para A (muito comum em delegates e closures com self).',
        keyPoints: [
          'Use [weak self] dentro de closures assíncronas que capturam o controller/view.',
          'Delegates devem sempre ser declarados como weak: weak var delegate: MyDelegate?',
          'weak transforma a variável em Optional e é zerada para nil automaticamente quando desalocada.',
          'unowned só deve ser usado quando temos certeza matemática de que o objeto referenciado existirá durante toda a vida do proprietário.'
        ],
        codeExample: 'networkService.fetchData { [weak self] result in\n  guard let self = self else { return }\n  self.updateUI(with: result)\n}'
      },
      {
        topic: '3. Optionals & Unwrapping Seguro',
        content: 'Optionals eliminam NullPointerExceptions forçando o tratamento explícito da ausência de valor (.none / nil). O force unwrap (!) só deve ser usado em testes ou outlets que são garantidos pelo carregamento do XIB/Storyboard.',
        keyPoints: [
          'if let: desempacota dentro de um bloco delimitado por chaves.',
          'guard let: desempacota com early exit, mantendo as variáveis no escopo principal.',
          'Nil-Coalescing (??): fornece um fallback elegante caso o valor seja nil.',
          'Optional Chaining (?.): executa chamadas em cadeia parando silenciosamente se qualquer elo for nil.'
        ],
        codeExample: 'guard let email = user.email, !email.isEmpty else {\n  throw ValidationError.missingEmail\n}\nprint("Email válido: \\(email)")'
      },
      {
        topic: '4. Concorrência Moderna: async/await & Actors',
        content: 'Swift 5.5+ substituiu completion handlers legados por async/await estruturado, eliminando o "callback hell" e garantindo segurança em tempo de compilação contra Data Races.',
        keyPoints: [
          '@MainActor garante que funções de UI executem na thread principal.',
          'await indica um ponto de suspensão voluntária sem travar a thread subjacente.',
          'Actors protegem seu estado mutável isolando o acesso a suas propriedades.',
          'Task { } inicia um escopo assíncrono a partir de um contexto síncrono.'
        ],
        codeExample: '@MainActor\nfunc loadProfile() async {\n  let data = await api.fetchUser()\n  self.user = data\n}'
      },
      {
        topic: '5. SwiftUI: Gerenciamento de Estado Reativo',
        content: 'SwiftUI é puramente declarativo: o estado da aplicação é a única fonte da verdade e determina diretamente o que é renderizado na tela.',
        keyPoints: [
          '@State: estado local e simples interno da View.',
          '@Binding: referência bidirecional para um estado de uma View ancestral.',
          '@StateObject: inicializa e possui a vida de um objeto Observable (iOS 14-16).',
          '@Observable (iOS 17+): macro moderna que substitui ObservableObject com rastreamento granular.'
        ]
      }
    ]
  },
  {
    id: 'exam-1',
    title: 'Simulado Swift: Fundamentos',
    description: '45 minutos focado inteiramente na base da linguagem (Variáveis, Optionals, Coleções, Funções, ARC, Value vs Reference Types).',
    category: 'Fundamentos',
    timeLimitMinutes: 45,
    questions: [
      {
        id: 1,
        question: 'Ao passar uma Struct como parâmetro para uma função em Swift, o que acontece por padrão?',
        options: [
          'Ela é passada por referência.',
          'Ela é passada por valor, sendo feita uma cópia constante (let).',
          'Ela pode ser modificada livremente dentro da função.',
          'O compilador exige o uso de ponteiros unsafe.'
        ],
        correctIndex: 1,
        explanation: 'Structs são Value Types e, por padrão, parâmetros de funções são constantes.'
      },
      {
        id: 2,
        question: 'Qual a forma correta de realizar um unwrap seguro de múltiplos Optionals simultaneamente?',
        options: [
          'if let a = optA, let b = optB { }',
          'if let a = optA && let b = optB { }',
          'guard let a = optA, b = optB else { }',
          'if optA != nil, optB != nil { let a = optA!, let b = optB! }'
        ],
        correctIndex: 0,
        explanation: 'O Swift permite encadear Optional Bindings com vírgulas.'
      },
      {
        id: 3,
        question: 'O que a palavra-chave mutating permite em uma Struct?',
        options: [
          'Permite que ela herde de uma Classe.',
          'Permite que seus métodos modifiquem as propriedades da própria Struct.',
          'Transforma a Struct em uma Classe em tempo de compilação.',
          'Marca a Struct para o Garbage Collector.'
        ],
        correctIndex: 1,
        explanation: 'Como Structs são imutáveis por padrão, métodos que modificam seus valores precisam ser marcados como mutating.'
      },
      {
        id: 4,
        question: 'Qual é o ciclo de retenção clássico gerado em closures, e como preveni-lo?',
        options: [
          'Closures não geram ciclos de retenção em Swift.',
          'Ocorre quando um objeto mantém forte referência para uma closure, que por sua vez captura "self" fortemente. Resolve-se com [weak self].',
          'Ocorre com Structs encadeadas. Resolve-se com [unowned self].',
          'Ocorre no delegate. Resolve-se usando "lazy".'
        ],
        correctIndex: 1,
        explanation: 'Closures são Reference Types e capturam variáveis externas fortemente por padrão.'
      },
      {
        id: 5,
        question: 'Em que cenário um defer bloco será executado?',
        options: [
          'Logo antes de o escopo atual ser encerrado (antes do return ser efetivado).',
          'Apenas se ocorrer um erro e um catch for disparado.',
          'Assim que for declarado.',
          'Em uma thread secundária (background).'
        ],
        correctIndex: 0,
        explanation: 'O bloco defer garante execução no exato momento da saída do escopo, ideal para limpar recursos.'
      }
    ]
  },
  {
    id: 'exam-2',
    title: 'Simulado Apple Dev: iOS & Arquitetura',
    description: 'Focado no ecossistema UIKit, SwiftUI e gerenciamento de estado (MVVM). 10 questões, 30 minutos.',
    category: 'iOS e iPadOS',
    timeLimitMinutes: 30,
    questions: [
      {
        id: 1,
        question: 'Em SwiftUI, como você propaga mudanças em um objeto de estado (Reference Type) para atualizar todas as Views conectadas?',
        options: [
          'Marcando o objeto como @StateObject e usando didSet.',
          'Adotando ObservableObject na classe e usando @Published nas propriedades.',
          'Emitindo uma NotificationCenter.default.post().',
          'Chamando view.setNeedsDisplay().'
        ],
        correctIndex: 1,
        explanation: 'Classes devem ser ObservableObject e propriedades que geram renderização devem ser @Published.'
      },
      {
        id: 2,
        question: 'Qual lifecycle modifier substitui o antigo viewDidAppear do UIKit no SwiftUI?',
        options: [
          '.onAppear',
          '.onLoad',
          '.onReady',
          '.task'
        ],
        correctIndex: 0,
        explanation: '.onAppear executa a closure quando a View aparece na tela.'
      },
      {
        id: 3,
        question: 'Ao lidar com concorrência (async/await), o que @MainActor garante?',
        options: [
          'Que a tarefa será executada em background.',
          'Que a função ou tipo sempre operará na Main Thread (Thread principal da UI).',
          'Que a função nunca vai causar Data Race.',
          'Que a API não vai bloquear.'
        ],
        correctIndex: 1,
        explanation: 'Todas as operações de interface do usuário devem ser na Main Thread; @MainActor força esse comportamento.'
      },
      {
        id: 4,
        question: 'Ao injetar dados profundamente na hierarquia de Views (SwiftUI), qual é a melhor abordagem?',
        options: [
          'Passar por parâmetro no init de View por View.',
          'Usar Variáveis Globais (Singletons).',
          'Usar .environmentObject() ou @Environment()',
          'Salvar no UserDefaults e ler em cada view.'
        ],
        correctIndex: 2,
        explanation: 'O Environment é desenhado exatamente para injeção de dependência profunda sem "prop drilling".'
      },
      {
        id: 5,
        question: 'No UIKit, ao adicionar uma subview programaticamente usando Auto Layout, o que NUNCA pode ser esquecido?',
        options: [
          'Chamar view.layoutIfNeeded() imediatamente.',
          'Definir translatesAutoresizingMaskIntoConstraints = false',
          'Definir a cor de fundo como transparente.',
          'Herdar a view de um UIButton.'
        ],
        correctIndex: 1,
        explanation: 'Se isso não for feito, as constraints criadas manualmente entrarão em conflito com as constraints automáticas de conversão do frame antigo (autoresizing mask).'
      }
    ]
  },
  {
    id: 'exam-3',
    title: 'Desafio iOSLab (Apple Academy - Brasil)',
    description: 'Simulado focado nos exames de entrada e laboratórios de Swift e iOS no Brasil. Testa raciocínio lógico, estruturas fundamentais e arquitetura Apple.',
    category: 'Fundamentos',
    timeLimitMinutes: 30,
    questions: [
      {
        id: 1,
        question: 'Em Swift, qual é a principal diferença entre let e var?',
        options: [
          'let declara uma variável livre, var declara uma constante estrita.',
          'let declara uma constante cujo valor não pode ser alterado, var declara uma variável mutável.',
          'let só pode ser usado para números (Inteiros/Doubles), var para Strings.',
          'let aloca na Heap, var aloca na Stack.'
        ],
        correctIndex: 1,
        explanation: 'A palavra-chave `let` cria constantes imutáveis, enquanto `var` cria variáveis que podem ter seus valores alterados durante a execução.'
      },
      {
        id: 2,
        question: 'Se você tentar forçar o desempacotamento (force unwrap) de um Optional usando ! e o valor for nil, o que ocorrerá?',
        options: [
          'O valor será convertido automaticamente para 0 ou string vazia.',
          'O compilador emitirá um alerta, mas ignorará a linha.',
          'O aplicativo sofrerá um "crash" (erro fatal em tempo de execução).',
          'A variável será removida da memória.'
        ],
        correctIndex: 2,
        explanation: 'Fazer o force unwrap (`!`) de um valor nil causa um crash (Fatal Error: unexpectedly found nil). É por isso que sempre devemos usar if let ou guard let.'
      },
      {
        id: 3,
        question: 'Qual dos seguintes tipos em Swift é um Reference Type (Tipo de Referência)?',
        options: [
          'Struct',
          'Enum',
          'Tuple',
          'Class'
        ],
        correctIndex: 3,
        explanation: 'Classes são Reference Types. Structs, Enums e Tuplas são Value Types em Swift.'
      },
      {
        id: 4,
        question: 'O que o padrão "Delegate" (Delegação) mais comumente permite no ecossistema Apple?',
        options: [
          'Rodar tarefas muito pesadas de rede em background.',
          'Permitir que um objeto repasse responsabilidades e eventos para outro objeto (ex: toques em botões ou células).',
          'Desenhar as interfaces de usuário de forma declarativa.',
          'Substituir o uso de herança de Structs.'
        ],
        correctIndex: 1,
        explanation: 'Delegação é um padrão de projeto (Design Pattern) que permite a um objeto delegar a responsabilidade de executar uma ação a outro, comum no UIKit (como UITableViewDelegate).'
      },
      {
        id: 5,
        question: 'Em lógica de programação Swift, o que a propriedade .count retorna ao ser chamada em um Array [1, 2, 3] após um .append(4)?',
        options: [
          '3',
          '4',
          '[1, 2, 3, 4]',
          'nil'
        ],
        correctIndex: 1,
        explanation: 'O método .append(4) adiciona um elemento, aumentando o total do array de 3 para 4 elementos.'
      },
      {
        id: 6,
        question: 'Qual é o tipo de retorno de uma closure declarada como "(Int, Int) -> Bool"?',
        options: [
          'Uma tupla de inteiros',
          'Um valor booleano (Bool)',
          'Uma função que recebe Bool',
          'Void'
        ],
        correctIndex: 1,
        explanation: 'A closure recebe dois inteiros `(Int, Int)` como argumentos e retorna um valor booleano `-> Bool`.'
      },
      {
        id: 7,
        question: 'Em Swift, o que a declaração "lazy var" faz?',
        options: [
          'Torna a variável acessível apenas em background threads.',
          'Adia a inicialização da propriedade até o primeiro momento em que ela é acessada no código.',
          'Destrói a variável automaticamente após 10 segundos de inatividade.',
          'Transforma a variável em constante imutável.'
        ],
        correctIndex: 1,
        explanation: '`lazy var` calcula o valor inicial da propriedade somente quando ela é lida pela primeira vez, poupando processamento e memória durante a inicialização.'
      },
      {
        id: 8,
        question: 'Como você define um método que pode lançar erros em Swift?',
        options: [
          'func carregar() canFail { }',
          'func carregar() throws { }',
          'func carregar() raises Exception { }',
          'func carregar() -> Error { }'
        ],
        correctIndex: 1,
        explanation: 'Em Swift, a palavra reservada `throws` antes do tipo de retorno declara que a função pode propagar erros.'
      }
    ]
  },
  {
    id: 'exam-4',
    title: 'Entrevista Dev iOS Sênior (América Latina)',
    description: 'Simulado avançado voltado para vagas Pleno/Sênior. Explora MVVM, Memory Management (ARC), Concorrência e ciclo de vida. (5 questões, 25 minutos).',
    category: 'Full-Stack Apple',
    timeLimitMinutes: 25,
    questions: [
      {
        id: 1,
        question: 'Ao trabalhar com closures que executam tarefas assíncronas e capturam "self", por que frequentemente utilizamos [weak self]?',
        options: [
          'Para garantir que a closure execute mais rápido na Main Thread.',
          'Para evitar vazamentos de memória (Memory Leaks) causados por ciclos de retenção (Retain Cycles).',
          'Porque o compilador do Swift 5 exige weak em todas as closures escapatórias.',
          'Para transformar temporariamente a classe em um tipo de valor.'
        ],
        correctIndex: 1,
        explanation: 'Se um objeto mantém uma referência forte para uma closure, e a closure captura o objeto fortemente, ocorre um Retain Cycle e ambos nunca são desalocados da memória.'
      },
      {
        id: 2,
        question: 'Qual é a principal responsabilidade da camada ViewModel na arquitetura MVVM?',
        options: [
          'Desenhar a interface (UI) de forma programática utilizando SwiftUI ou UIKit.',
          'Conter estritamente os dados serializados do banco de dados local.',
          'Intermediar a Model e a View, abstraindo a lógica de apresentação e gerenciando o estado visual.',
          'Realizar exclusivamente o roteamento de fluxo (Routing) entre as telas.'
        ],
        correctIndex: 2,
        explanation: 'O ViewModel processa dados da Model e os formata em propriedades observáveis para que a View reaja (Data Binding), retirando essa complexidade das Views (ou ViewControllers).'
      },
      {
        id: 3,
        question: 'Com a introdução do Swift Concurrency, o que a palavra-chave "await" indica?',
        options: [
          'Ela trava a thread atual indefinidamente até a tarefa ser finalizada.',
          'Ela marca um ponto de suspensão, onde a thread pode ser liberada para outros trabalhos enquanto aguarda o resultado.',
          'Ela obriga a inicialização imediata de uma tarefa em uma fila serial do GCD.',
          'Ela apenas injeta um completion handler de forma assíncrona.'
        ],
        correctIndex: 1,
        explanation: 'O `await` indica um Suspension Point. O sistema pode suspender a execução daquela função e usar a thread atual para outra coisa até que o resultado assíncrono chegue.'
      },
      {
        id: 4,
        question: 'Ao persistir dados estruturados localmente em um app iOS corporativo, qual das opções abaixo NÃO é um mecanismo primário (nativo) da Apple?',
        options: [
          'Core Data',
          'SwiftData',
          'Realm',
          'UserDefaults'
        ],
        correctIndex: 2,
        explanation: 'Realm é um banco de dados poderoso e muito usado no mercado, mas é de terceiros (mantido pela MongoDB). Core Data e SwiftData são os frameworks nativos de persistência da Apple.'
      },
      {
        id: 5,
        question: 'No ciclo de vida de uma UIViewController (UIKit), qual método é chamado imediatamente após as subviews terem os seus tamanhos ajustados e o Auto Layout ser aplicado?',
        options: [
          'viewDidLoad()',
          'viewWillAppear()',
          'viewDidAppear()',
          'viewDidLayoutSubviews()'
        ],
        correctIndex: 3,
        explanation: '`viewDidLayoutSubviews` é chamado após o sistema de layout ajustar os bounds/frames das views filhas. É o local ideal para pegar dimensões reais e desenhar gradientes, por exemplo.'
      }
    ]
  }
];

const LOCAL_STORAGE_CUSTOM_EXAMS_KEY = 'swift_lab_custom_exams_v1';

export function getCustomImportedExams(): MockExam[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const raw = localStorage.getItem(LOCAL_STORAGE_CUSTOM_EXAMS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((exam): exam is MockExam => Boolean(exam && typeof exam === 'object' && exam.id && exam.title))
      .map(exam => {
        const questions = Array.isArray(exam.questions) 
          ? exam.questions
              .filter((q: any) => q && typeof q === 'object' && typeof q.question === 'string' && q.question.trim().length > 0)
              .map((q: any, idx: number) => ({
                id: q.id || idx + 1,
                question: q.question.trim(),
                options: Array.isArray(q.options) && q.options.length > 0 
                  ? q.options.map(String) 
                  : ['Verdadeiro', 'Falso'],
                correctIndex: typeof q.correctIndex === 'number' && q.correctIndex >= 0 ? q.correctIndex : 0,
                explanation: typeof q.explanation === 'string' && q.explanation.trim().length > 0 
                  ? q.explanation.trim() 
                  : 'Revisão conceitual do material.'
              }))
          : [];

        return {
          id: String(exam.id),
          title: String(exam.title || 'Simulado Customizado'),
          description: String(exam.description || 'Simulado importado'),
          category: exam.category || 'iOS Lab / Simulado',
          timeLimitMinutes: typeof exam.timeLimitMinutes === 'number' ? exam.timeLimitMinutes : 20,
          questions,
          revisionNotes: Array.isArray(exam.revisionNotes) ? exam.revisionNotes : [],
          isCustomImported: true
        };
      });
  } catch (e) {
    console.error('Error loading custom exams:', e);
    return [];
  }
}

export function saveCustomImportedExam(exam: MockExam): MockExam[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const current = getCustomImportedExams();
    const updated = [exam, ...current.filter(e => e.id !== exam.id)];
    localStorage.setItem(LOCAL_STORAGE_CUSTOM_EXAMS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error saving custom exam:', e);
    return [];
  }
}

export function deleteCustomImportedExam(examId: string): MockExam[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const current = getCustomImportedExams();
    const updated = current.filter(e => e.id !== examId);
    localStorage.setItem(LOCAL_STORAGE_CUSTOM_EXAMS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error deleting custom exam:', e);
    return [];
  }
}
