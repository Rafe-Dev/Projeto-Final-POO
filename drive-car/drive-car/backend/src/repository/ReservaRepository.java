package repository;

import exception.ReservaNaoEncontradaException;
import model.Reserva;

import java.util.ArrayList;
import java.util.List;


public class ReservaRepository {

    private List<Reserva> reservas;

    public ReservaRepository() {
        this.reservas = new ArrayList<>();
    }

    public void salvar(Reserva r) {
        reservas.add(r);
    }

    public Reserva buscarPorId(int id) throws ReservaNaoEncontradaException {
        for (Reserva r : reservas) {
            if (r.getId() == id) return r;
        }
        throw new ReservaNaoEncontradaException(id);
    }

    public List<Reserva> listarAtivas() {
        List<Reserva> ativas = new ArrayList<>();
        for (Reserva r : reservas) {
            if (r.isAtiva()) ativas.add(r);
        }
        return ativas;
    }

    public List<Reserva> listarPorCliente(String nomeCliente) {
        List<Reserva> resultado = new ArrayList<>();
        for (Reserva r : reservas) {
            if (r.getClienteNome().equalsIgnoreCase(nomeCliente)) {
                resultado.add(r);
            }
        }
        return resultado;
    }

    public List<Reserva> listarTodas() {
        return new ArrayList<>(reservas);
    }

    public int totalReservas() {
        return reservas.size();
    }
}
