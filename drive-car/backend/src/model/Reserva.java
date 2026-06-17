package model;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;


public class Reserva {

    private static int contadorId = 1;

    private int id;
    private String clienteNome;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private Veiculo veiculo;
    private boolean ativa;
    private double valorTotal;

    public Reserva(String clienteNome, LocalDate dataInicio, LocalDate dataFim, Veiculo veiculo) {
        this.id = contadorId++;
        this.clienteNome = clienteNome;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
        this.veiculo = veiculo;
        this.ativa = true;
        long dias = ChronoUnit.DAYS.between(dataInicio, dataFim);
        this.valorTotal = dias * veiculo.calcularCustoDiaria();
    }

    public void cancelar() {
        this.ativa = false;
    }

    public int getId() { return id; }
    public String getClienteNome() { return clienteNome; }
    public LocalDate getDataInicio() { return dataInicio; }
    public LocalDate getDataFim() { return dataFim; }
    public Veiculo getVeiculo() { return veiculo; }
    public boolean isAtiva() { return ativa; }
    public double getValorTotal() { return valorTotal; }

    @Override
    public String toString() {
        return "Reserva #" + id + " | Cliente: " + clienteNome +
               " | Veículo: " + veiculo.getPlaca() +
               " | " + dataInicio + " → " + dataFim +
               " | Total: R$" + String.format("%.2f", valorTotal) +
               " | Status: " + (ativa ? "Ativa" : "Cancelada");
    }
}
