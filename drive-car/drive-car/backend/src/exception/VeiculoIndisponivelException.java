package exception;


public class VeiculoIndisponivelException extends Exception {

    private String placa;

    public VeiculoIndisponivelException(String placa) {
        super("Veículo com placa " + placa + " não está disponível.");
        this.placa = placa;
    }

    public VeiculoIndisponivelException(String placa, String mensagem) {
        super(mensagem);
        this.placa = placa;
    }

    public String getPlaca() { return placa; }
}
