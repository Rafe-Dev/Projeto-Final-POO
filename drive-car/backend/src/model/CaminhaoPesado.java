package model;


public class CaminhaoPesado extends Caminhao {

    private boolean possuiRefrigeracao;
    private int numeroReboques;

    public CaminhaoPesado(String placa, String marca, String modelo, int ano,
                          double precoDiaria, double capacidadeCarga, int numeroEixos,
                          boolean possuiRefrigeracao, int numeroReboques) {
        super(placa, marca, modelo, ano, precoDiaria, capacidadeCarga, numeroEixos);
        this.possuiRefrigeracao = possuiRefrigeracao;
        this.numeroReboques = numeroReboques;
    }

    @Override
    public String getTipoVeiculo() {
        return "Caminhão Pesado";
    }

    @Override
    public double calcularCustoDiaria() {
        double base = super.calcularCustoDiaria();
        if (possuiRefrigeracao) base += 200.0;
        base += numeroReboques * 150.0;
        return base;
    }

    public boolean isPossuiRefrigeracao() { return possuiRefrigeracao; }
    public int getNumeroReboques() { return numeroReboques; }

    @Override
    public String toString() {
        return super.toString() + " | Refrigeração: " + (possuiRefrigeracao ? "Sim" : "Não") +
               " | Reboques: " + numeroReboques;
    }
}
