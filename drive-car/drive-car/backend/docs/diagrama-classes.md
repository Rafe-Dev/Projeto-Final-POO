# 📐 Diagrama de Classes — Locadora de Veículos

## Hierarquia de Herança

```
                    ┌──────────────────┐
                    │  <<interface>>    │
                    │   Reservavel      │
                    ├──────────────────┤
                    │ + reservar()      │
                    │ + cancelarReserva()│
                    │ + estaDisponivel()│
                    └─────────▲────────┘
                              │ implements
                    ┌──────────────────┐
                    │  <<interface>>    │
                    │   Manutencao      │
                    ├──────────────────┤
                    │ + realizarManutencao()│
                    │ + getHistoricoManutencao()│
                    │ + precisaManutencao() │
                    └─────────▲────────┘
                              │ implements
                    ┌──────────────────┐
                    │ <<abstract>>      │
                    │     Veiculo       │
                    ├──────────────────┤
                    │ - placa: String   │
                    │ - marca: String   │
                    │ - modelo: String  │
                    │ - ano: int        │
                    │ - precoDiaria: double │
                    │ - opcionais: Set<String> │
                    ├──────────────────┤
                    │ + calcularCustoDiaria(): double {abstract} │
                    │ + getTipoVeiculo(): String {abstract}      │
                    └─────────▲────────┘
                  ┌────────────┴────────────┐
                  │                         │
         ┌──────────────────┐      ┌──────────────────┐
         │      Carro        │      │     Caminhao      │
         ├──────────────────┤      ├──────────────────┤
         │ - numeroPortas    │      │ - capacidadeToneladasCarga │
         │ - tipoCombustivel │      │ - numeroEixos     │
         └─────────▲────────┘      └─────────▲────────┘
                   │                          │
         ┌──────────────────┐      ┌──────────────────┐
         │  CarroEletrico    │      │  CaminhaoPesado   │
         ├──────────────────┤      ├──────────────────┤
         │ - autonomiaKm     │      │ - possuiRefrigeracao │
         │ - percentualBateria │    │ - numeroReboques  │
         └──────────────────┘      └──────────────────┘
```

## Relacionamentos

- **Veiculo (1) ── (N) Reserva**: um veículo pode ter várias reservas (histórico)
- **Cliente (1) ── (N) Reserva**: um cliente pode ter várias reservas
- **LocadoraService** orquestra `VeiculoRepository`, `ClienteRepository` e `ReservaRepository`

## Fluxo Principal (fazerReserva)

1. `Main` chama `LocadoraService.fazerReserva(cpf, placa, inicio, fim)`
2. Service busca `Cliente` no `ClienteRepository` (pode lançar `ClienteNaoEncontradoException`)
3. Service busca `Veiculo` no `VeiculoRepository` (pode lançar `VeiculoIndisponivelException`)
4. Verifica disponibilidade → chama `veiculo.reservar(...)`
5. Persiste a `Reserva` no `ReservaRepository`
6. Adiciona CPF ao `Set<String>` de clientes únicos
7. Bloco `finally` sempre executa, independente do resultado
