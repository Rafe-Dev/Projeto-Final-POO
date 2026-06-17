package model;


public class CarroEletrico extends Carro {

    private int autonomiaKm;
    private double percentualBateria;

    public CarroEletrico(String placa, String marca, String modelo, int ano,
                         double precoDiaria, int numeroPortas, int autonomiaKm) {
        super(placa, marca, modelo, ano, precoDiaria, numeroPortas, "Elétrico");
        this.autonomiaKm = autonomiaKm;
        this.percentualBateria = 100.0;
    }

    @Override
    public String getTipoVeiculo() {
        return "Carro Elétrico";
    }

    @Override
    public double calcularCustoDiaria() {

        return getPrecoDiaria() * 1.20;
    }

    public void recarregar() {
        this.percentualBateria = 100.0;
        System.out.println("Bateria recarregada a 100%!");
    }

    public int getAutonomiaKm() { return autonomiaKm; }
    public double getPercentualBateria() { return percentualBateria; }

    @Override
    public String toString() {
        return super.toString() + " | Autonomia: " + autonomiaKm + "km | Bateria: " + percentualBateria + "%";
    }
}
