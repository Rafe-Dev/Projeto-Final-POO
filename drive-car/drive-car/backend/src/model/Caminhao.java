package model;


public class Caminhao extends Veiculo {

    private double capacidadeToneladasCarga;
    private int numeroEixos;

    public Caminhao(String placa, String marca, String modelo, int ano,
                    double precoDiaria, double capacidadeToneladasCarga, int numeroEixos) {
        super(placa, marca, modelo, ano, precoDiaria);
        this.capacidadeToneladasCarga = capacidadeToneladasCarga;
        this.numeroEixos = numeroEixos;
    }

    @Override
    public String getTipoVeiculo() {
        return "Caminhão";
    }

    @Override
    public double calcularCustoDiaria() {

        return getPrecoDiaria() + (capacidadeToneladasCarga * 50.0);
    }

    public double getCapacidadeToneladasCarga() { return capacidadeToneladasCarga; }
    public int getNumeroEixos() { return numeroEixos; }

    @Override
    public String toString() {
        return super.toString() + " | Carga: " + capacidadeToneladasCarga + "t | Eixos: " + numeroEixos;
    }
}
