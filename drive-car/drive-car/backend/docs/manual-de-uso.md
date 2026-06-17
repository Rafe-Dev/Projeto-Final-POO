# 📖 Manual de Uso — Sistema Locadora de Veículos

## Pré-requisitos

- JDK 11 ou superior instalado
- Terminal / linha de comando

## Compilação

A partir da pasta raiz do projeto, entre em `src/`:

```bash
cd src
javac -d ../out model/*.java exception/*.java repository/*.java service/*.java util/*.java main/*.java
```

## Execução

```bash
cd ..
java -cp out main.Main
```

## O que o `Main.java` demonstra

| Etapa | O que acontece |
|-------|----------------|
| 1. Cadastro de veículos | 5 veículos cadastrados (2 carros, 1 elétrico, 1 caminhão, 1 caminhão pesado) |
| 2. Opcionais (Set) | Adiciona itens a um `Set<String>` — duplicatas são automaticamente ignoradas |
| 3. Polimorfismo | Itera sobre `List<Veiculo>` chamando `calcularCustoDiaria()` — cada subclasse calcula de forma diferente |
| 4. Cadastro de clientes | 2 clientes cadastrados |
| 5. Reservas | Reservas válidas são feitas com sucesso |
| 6. Exceção: veículo indisponível | Tenta reservar um carro já reservado → `VeiculoIndisponivelException` |
| 7. Exceção: cliente inexistente | Tenta reservar com CPF não cadastrado → `ClienteNaoEncontradoException` |
| 8. Manutenção | Envia veículo para manutenção e depois finaliza |
| 9. Cancelamento | Cancela uma reserva existente |
| 10. Relatório final | Exibe frota completa, reservas ativas e estatísticas |

## Como estender o projeto

- **Novo tipo de veículo**: crie uma classe que estenda `Veiculo` (ou uma de suas subclasses) e implemente `calcularCustoDiaria()` e `getTipoVeiculo()`.
- **Nova exceção**: crie uma classe em `exception/` que estenda `Exception`.
- **Nova regra de negócio**: adicione um método em `LocadoraService` com bloco `try-catch-finally`.
