package model;


public class Carro extends Veiculo {

    private int numeroPortas;
    private String tipoCombustivel;

    public Carro(String placa, String marca, String modelo, int ano,
                 double precoDiaria, int numeroPortas, String tipoCombustivel) {
        super(placa, marca, modelo, ano, precoDiaria);
        this.numeroPortas = numeroPortas;
        this.tipoCombustivel = tipoCombustivel;
    }

    @Override
    public String getTipoVeiculo() {
        return "Carro";
    }

    @Override
    public double calcularCustoDiaria() {

        if (tipoCombustivel.equalsIgnoreCase("flex")) {
            return getPrecoDiaria() * 0.90;
        }
        return getPrecoDiaria();
    }

    public int getNumeroPortas() { return numeroPortas; }
    public String getTipoCombustivel() { return tipoCombustivel; }

    @Override
    public String toString() {
        return super.toString() + " | Portas: " + numeroPortas + " | Combustível: " + tipoCombustivel;
    }
}
