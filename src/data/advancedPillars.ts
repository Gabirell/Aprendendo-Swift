import { PillarContent } from '../types';

export const advancedPillars: PillarContent[] = [
  {
    id: 12,
    title: "Protocol-Oriented Programming (POP)",
    theory: "O Swift foi desenhado como uma linguagem orientada a protocolos. Em vez de herdar comportamentos de uma superclasse (OOP), você adota protocolos. Isso resolve problemas de herança múltipla e acoplamento forte. Protocol Extensions permitem fornecer implementações padrão, trazendo superpoderes às Structs e Enums.",
    appleDocUrl: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/protocols/",
    isAdvanced: true,
    category: "Swift Avançado",
    corporateCase: "Temos um app de banco com várias views de 'Erro'. Em vez de herdar de um BaseErrorViewController, criamos um protocolo 'ErrorPresentable' com uma extension default que mostra o alerta, aplicável a qualquer ViewController.",
    gameCase: "Personagens e Inimigos podem atacar. Em vez de uma classe 'Combatant', usamos protocolos 'Attackable' e 'Damageable'. Um barril explosivo pode ser 'Damageable' sem ser um inimigo.",
    exercises: [
      { id: 1, question: "O que permite dar um comportamento padrão a um protocolo?", codeSnippet: "___ MeuProtocolo { func fazAlgo() { print(\"Padrão\") } }", correctAnswer: "extension", hint: "Extensão." },
      { id: 2, question: "Structs podem herdar de classes?", codeSnippet: "struct MinhaStruct: ___ {}", correctAnswer: "Protocolo", hint: "Apenas adotam protocolos." }
    ],
    quiz: [
      { id: 1, question: "Qual é a principal vantagem de Protocol-Oriented Programming sobre herança clássica?", options: ["Desempenho mais rápido", "Permite herança de múltiplas fontes via composição e funciona com Value Types", "Substitui completamente as Classes", "É a única forma de usar SwiftUI"], correctIndex: 1, explanation: "POP permite composição flexível e funciona perfeitamente com Structs, evitando os problemas da herança de classes profunda." }
    ]
  },
  {
    id: 13,
    title: "Generics",
    theory: "Generics permitem escrever código flexível e reutilizável que funciona com qualquer tipo, mantendo a segurança de tipo (Type Safety). Em vez de escrever funções separadas para Int, String e Float, você escreve uma função com um placeholder '<T>'. Arrays e Optionals no Swift são construídos usando Generics sob o capô.",
    appleDocUrl: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/generics/",
    isAdvanced: true,
    category: "Swift Avançado",
    corporateCase: "Um serviço de API 'NetworkManager' que busca e decodifica dados. Em vez de ter 'fetchUser' e 'fetchTransaction', usamos 'func fetch<T: Decodable>(type: T.Type) -> T'.",
    gameCase: "Um sistema de inventário que precisa guardar armas, poções ou armaduras. Usamos um 'struct Inventory<Element>' genérico para armazenar e organizar qualquer tipo de item do jogo.",
    exercises: [
      { id: 1, question: "Como definimos uma função genérica em Swift?", codeSnippet: "func swapTwoValues___(_ a: inout T, _ b: inout T)", correctAnswer: "<T>", hint: "Entre sinais de menor e maior." }
    ],
    quiz: [
      { id: 1, question: "Qual é o propósito da constraint 'T: Equatable' em um Generic?", options: ["Para dizer que T é um número", "Garantir que os elementos do tipo T possam ser comparados com '=='", "Para fazer T ser opcional", "Para garantir que T não é nil"], correctIndex: 1, explanation: "Constraints em generics garantem que o tipo passado cumpra certos requisitos, como conformidade a protocolos (ex: Equatable)." }
    ]
  },
  {
    id: 14,
    title: "Ciclo de Vida (UIKit vs SwiftUI)",
    theory: "O ciclo de vida de um app define como ele inicia, vai para o background e retorna. Antigamente, o AppDelegate gerenciava tudo. Depois, surgiu o SceneDelegate para múltiplas janelas (iPadOS). No SwiftUI, usamos a struct 'App' e o wrapper @main. Entender esses estados é essencial para salvar dados, pausar áudio e economizar bateria.",
    appleDocUrl: "https://developer.apple.com/documentation/uikit/app_and_environment/managing_your_app_s_life_cycle",
    isAdvanced: true,
    category: "iOS e iPadOS",
    corporateCase: "Um app de finanças esconde o saldo e mostra um logo do banco (blur) assim que o app entra em 'background' para evitar que as informações vazem na tela de multitarefa do iOS.",
    gameCase: "Um jogo pausa automaticamente e salva o progresso do jogador quando ele recebe uma ligação, ativando o estado 'sceneWillResignActive'.",
    exercises: [
      { id: 1, question: "Em SwiftUI, qual modifier detecta mudanças de estado do app?", codeSnippet: ".onReceive(NotificationCenter.default.publisher(for: UIApplication.___))", correctAnswer: "didEnterBackgroundNotification", hint: "Quando entra no fundo." }
    ],
    quiz: [
      { id: 1, question: "Qual é a diferença entre 'willResignActive' e 'didEnterBackground'?", options: ["Nenhuma, são o mesmo estado", "willResignActive é quando o app é fechado permanentemente", "willResignActive ocorre quando uma interrupção surge (ex: ligação), mas o app ainda está na tela. didEnterBackground é quando ele some totalmente", "didEnterBackground só existe no Mac"], correctIndex: 2, explanation: "willResignActive é um estado transicional (inativo), enquanto didEnterBackground significa que o app está rodando no fundo (invisível)." }
    ]
  },
  {
    id: 15,
    title: "Interoperabilidade SwiftUI e UIKit",
    theory: "Embora o SwiftUI seja o futuro, muitos apps possuem bases de código em UIKit. Para usar uma View do SwiftUI no UIKit, usa-se 'UIHostingController'. Para usar uma view do UIKit no SwiftUI, criamos uma struct que adota 'UIViewRepresentable' ou 'UIViewControllerRepresentable'.",
    appleDocUrl: "https://developer.apple.com/tutorials/swiftui/interfacing-with-uikit",
    isAdvanced: true,
    category: "iOS e iPadOS",
    corporateCase: "Uma empresa possui um leitor de QR Code complexo feito em UIKit há 5 anos. Eles constroem a nova tela em SwiftUI, mas usam um UIViewControllerRepresentable para encapsular o antigo leitor e economizar meses de refatoração.",
    gameCase: "Um menu principal feito inteiramente e rapidamente em SwiftUI, que ao apertar 'Jogar' apresenta a engine pesada rodando em um UIViewController baseado em Metal ou SpriteKit.",
    exercises: [
      { id: 1, question: "Qual protocolo embrulha uma UIView nativa para SwiftUI?", codeSnippet: "struct Mapa: ___ { }", correctAnswer: "UIViewRepresentable", hint: "Representável como UIView." }
    ],
    quiz: [
      { id: 1, question: "O que o 'Coordinator' faz no UIViewRepresentable?", options: ["Sincroniza dados com o CoreData", "Comunica delegados (delegates) e eventos do UIKit de volta para o SwiftUI", "Controla as animações da tela", "Limpa a memória da View"], correctIndex: 1, explanation: "O Coordinator age como uma ponte, adotando protocolos de delegates do UIKit para atualizar o estado no SwiftUI." }
    ]
  },
  {
    id: 16,
    title: "watchOS & HealthKit",
    theory: "O watchOS exige designs rápidos, interações curtas (glances) e foca em saúde. Apps de watchOS hoje são independentes. HealthKit é o framework central que centraliza os dados de saúde do usuário (com permissões estritas) e permite que apps leiam/escrevam treinos, batimentos cardíacos, etc.",
    appleDocUrl: "https://developer.apple.com/documentation/watchos-apps",
    isAdvanced: true,
    category: "watchOS",
    corporateCase: "Um app de telemedicina lê a frequência cardíaca média do usuário via HealthKit no Apple Watch e alerta o médico se detectar anomalias severas durante a semana.",
    gameCase: "Um jogo estilo RPG ('Zombies, Run!') usa dados do pedômetro do HealthKit via Apple Watch para avançar a narrativa e fugir de monstros no jogo virtual.",
    exercises: [
      { id: 1, question: "O que o app deve solicitar antes de ler dados do HealthKit?", codeSnippet: "healthStore.request___(toShare: ..., read: ...)", correctAnswer: "Authorization", hint: "Permissão/Autorização." }
    ],
    quiz: [
      { id: 1, question: "Qual a melhor prática de UI no watchOS?", options: ["Telas profundas de navegação", "Textos longos para leitura e botões pequenos", "Informação direta, alto contraste, ações rápidas e complicações no mostrador", "Sempre exigir que o iPhone esteja conectado"], correctIndex: 2, explanation: "Interações no Watch devem durar segundos. Foca-se em legibilidade e acesso imediato à ação principal." }
    ]
  },
  {
    id: 17,
    title: "macOS (AppKit e SwiftUI)",
    theory: "O macOS possui um paradigma diferente: múltiplas janelas flutuantes, barra de menus, trackpad vs mouse, atalhos de teclado profundos. AppKit foi o padrão histórico, mas o SwiftUI agora unifica o desenvolvimento, permitindo compilar o app iOS para Mac (via Mac Catalyst ou Destino Nativo).",
    appleDocUrl: "https://developer.apple.com/design/human-interface-guidelines/macos",
    isAdvanced: true,
    category: "macOS",
    corporateCase: "Um editor de código no Mac utiliza comandos da 'Menu Bar' para ações principais e atalhos globais, oferecendo uma janela de preferências multi-tab nativa do macOS.",
    gameCase: "No macOS, um jogo converte controles touch (joysticks virtuais) para teclado (WASD) e clique do mouse, lidando ativamente com o redimensionamento de janela pelo usuário.",
    exercises: [
      { id: 1, question: "Qual framework tradicional compõe interfaces no Mac?", codeSnippet: "import ___", correctAnswer: "AppKit", hint: "Não é UIKit." }
    ],
    quiz: [
      { id: 1, question: "No SwiftUI para macOS, como se cria uma barra superior de comandos?", options: ["No AppDelegate", "Usando o modifier .commands e CommandMenu dentro do bloco App", "Usando UITabBar", "A barra de comandos é automática"], correctIndex: 1, explanation: "A declaração @main fornece a cena 'WindowGroup', na qual se atrela '.commands { CommandMenu(\"Menu\") { ... } }' para injetar comandos globais no Mac." }
    ]
  },
  {
    id: 18,
    title: "visionOS & Computação Espacial",
    theory: "O visionOS inaugura a Spatial Computing (Apple Vision Pro). Ele introduz Z-axis (profundidade), Windows (janelas 2D/3D), Volumes (objetos 3D limitados em uma caixa) e Immersive Spaces (VR total). O SwiftUI é a base para a UI 2D/3D, e o RealityKit é usado para renderizar cenas 3D imersivas e ancorar entidades no mundo real.",
    appleDocUrl: "https://developer.apple.com/visionos/",
    isAdvanced: true,
    category: "visionOS",
    corporateCase: "Um app de design de interiores usa 'Immersive Space' para projetar um sofá 3D no centro da sala real do usuário usando o RealityKit, medindo colisões nas paredes reais.",
    gameCase: "Um jogo de xadrez em visionOS flutua um 'Volume' 3D no meio da sala do usuário. Ele usa rastreamento de mãos (Hand Tracking) para que o jogador segure e mova as peças fisicamente.",
    exercises: [
      { id: 1, question: "Qual framework da Apple lida primariamente com renderização de física e objetos 3D no visionOS?", codeSnippet: "import ___", correctAnswer: "RealityKit", hint: "Kit de Realidade." }
    ],
    quiz: [
      { id: 1, question: "O que é um 'Volume' no visionOS?", options: ["O botão físico de aumentar som do aparelho", "Uma view do SwiftUI puramente 2D", "Um contêiner 3D limitado (bounding box) que coexiste com outros apps e objetos na sala do usuário", "Um modo que desliga o Pass-through de câmera"], correctIndex: 2, explanation: "Diferente de um Immersive Space completo, o Volume permite renderizar modelos 3D que dividem o espaço físico do usuário com outros apps (janelas compartilhadas)." }
    ]
  }
];
