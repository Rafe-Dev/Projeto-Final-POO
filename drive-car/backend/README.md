# 🚗 Drive Car — Locadora de Veículos
### Projeto POO — Gestão de Frota, Reservas e Manutenção

---

## 📁 Estrutura de Diretórios

```
projeto-equipe-5/
│
├── src/
│   ├── model/          # Classes de entidade
│   │   ├── Reservavel.java        (interface)
│   │   ├── Manutencao.java        (interface)
│   │   ├── Veiculo.java           (classe abstrata)
│   │   ├── Carro.java             (herança nível 1)
│   │   ├── CarroEletrico.java     (herança nível 2)
│   │   ├── Caminhao.java          (herança nível 1)
│   │   ├── CaminhaoPesado.java    (herança nível 2)
│   │   ├── Reserva.java
│   │   └── Cliente.java
│   │
│   ├── service/        # Lógica de negócio
│   │   └── LocadoraService.java
│   │
│   ├── repository/     # Persistência em memória
│   │   ├── VeiculoRepository.java
│   │   ├── ClienteRepository.java
│   │   └── ReservaRepository.java
│   │
│   ├── exception/      # Exceções customizadas
│   │   ├── VeiculoIndisponivelException.java
│   │   ├── ReservaNaoEncontradaException.java
│   │   └── ClienteNaoEncontradoException.java
│   │
│   ├── util/           # Utilitários
│   │   └── FormatadorUtil.java
│   │
│   └── main/           # Classe principal
│       └── Main.java
│
└── README.md
```

---

## ✅ Checklist Técnico

### Conceitos Avançados (Obrigatórios)

| Conceito | Implementação |
|----------|--------------|
| **Herança** | `Veiculo → Carro → CarroEletrico` e `Veiculo → Caminhao → CaminhaoPesado` (2 níveis) |
| **Polimorfismo** | `calcularCustoDiaria()` e `getTipoVeiculo()` — binding dinâmico em tempo de execução |
| **Classes Abstratas** | `Veiculo` é abstrata com métodos abstratos |
| **Interfaces (≥2)** | `Reservavel` e `Manutencao` com contratos e implementação completa |
| **Coleções** | `List<Veiculo>`, `Map<String, Veiculo>`, `Map<String, Cliente>`, iteradores |
| **Genéricos `<E>`** | Usado em todos os repositórios e listas |
| **Exceções (≥2 custom)** | `VeiculoIndisponivelException`, `ReservaNaoEncontradaException`, `ClienteNaoEncontradoException` |
| **Try-Catch-Finally** | Em todos os métodos de `LocadoraService` |

### Conceitos Básicos

| Conceito | Implementação |
|----------|--------------|
| Classes e Objetos | Todas as entidades: `Veiculo`, `Cliente`, `Reserva` |
| Encapsulamento | `private` + getters/setters em todas as classes |
| Constantes `final` | `Veiculo.KM_MANUTENCAO`, `FormatadorUtil.SEPARADOR` |
| Wrappers | `Integer`, `Double`, `Boolean` nos autoboxing das coleções |
| ArrayList / Map | Nos repositórios e coleções de reservas |

---

## 🚀 Como Compilar e Executar

```bash
# Compilar (dentro da pasta src/)
javac -d ../out model/*.java exception/*.java repository/*.java service/*.java util/*.java main/*.java

# Executar
java -cp ../out main.Main
```

---

## 👥 Equipe 5
