package model;

import java.time.LocalDate;


public interface Reservavel {
    void reservar(String clienteNome, LocalDate dataInicio, LocalDate dataFim) throws Exception;
    void cancelarReserva(String clienteNome) throws Exception;
    boolean estaDisponivel();
}
