package exception;


public class ReservaNaoEncontradaException extends Exception {

    private int idReserva;

    public ReservaNaoEncontradaException(int idReserva) {
        super("Reserva #" + idReserva + " não encontrada no sistema.");
        this.idReserva = idReserva;
    }

    public ReservaNaoEncontradaException(String clienteNome) {
        super("Nenhuma reserva ativa encontrada para o cliente: " + clienteNome);
        this.idReserva = -1;
    }

    public int getIdReserva() { return idReserva; }
}
