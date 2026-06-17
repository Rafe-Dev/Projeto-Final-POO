package model;

import java.util.ArrayList;
import java.util.List;


public class Cliente {

    private String nome;
    private String cpf;
    private String telefone;
    private String email;
    private List<Reserva> historicoReservas;

    public Cliente(String nome, String cpf, String telefone, String email) {
        this.nome = nome;
        this.cpf = cpf;
        this.telefone = telefone;
        this.email = email;
        this.historicoReservas = new ArrayList<>();
    }

    public void adicionarReserva(Reserva r) {
        historicoReservas.add(r);
    }

    public String getNome() { return nome; }
    public String getCpf() { return cpf; }
    public String getTelefone() { return telefone; }
    public String getEmail() { return email; }
    public List<Reserva> getHistoricoReservas() { return historicoReservas; }

    @Override
    public String toString() {
        return "Cliente: " + nome + " | CPF: " + cpf + " | Tel: " + telefone;
    }
}
