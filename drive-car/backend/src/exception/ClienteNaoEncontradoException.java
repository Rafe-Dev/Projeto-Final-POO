package exception;


public class ClienteNaoEncontradoException extends Exception {

    private String identificador;

    public ClienteNaoEncontradoException(String identificador) {
        super("Cliente não encontrado: " + identificador);
        this.identificador = identificador;
    }

    public String getIdentificador() { return identificador; }
}
