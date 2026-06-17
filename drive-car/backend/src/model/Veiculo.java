package model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;


public abstract class Veiculo implements Reservavel, Manutencao {


    public static final int KM_MANUTENCAO = 10000;

    private String placa;
    private String marca;
    private String modelo;
    private int ano;
    private double precoDiaria;
    private boolean disponivel;
    private int quilometragem;
    private List<String> historicoManutencao;
    private List<Reserva> reservas;
    private Set<String> opcionais; 

    public Veiculo(String placa, String marca, String modelo, int ano, double precoDiaria) {
        this.placa = placa;
        this.marca = marca;
        this.modelo = modelo;
        this.ano = ano;
        this.precoDiaria = precoDiaria;
        this.disponivel = true;
        this.quilometragem = 0;
        this.historicoManutencao = new ArrayList<>();
        this.reservas = new ArrayList<>();
        this.opcionais = new HashSet<>();
    }

    
    public abstract String getTipoVeiculo();

    public abstract double calcularCustoDiaria();

   

    @Override
    public void reservar(String clienteNome, LocalDate dataInicio, LocalDate dataFim) throws Exception {
        if (!disponivel) {
            throw new Exception("Veículo " + placa + " não está disponível para reserva.");
        }
        Reserva reserva = new Reserva(clienteNome, dataInicio, dataFim, this);
        reservas.add(reserva);
        this.disponivel = false;
    }

    @Override
    public void cancelarReserva(String clienteNome) throws Exception {
        Reserva encontrada = null;
        for (Reserva r : reservas) {
            if (r.getClienteNome().equals(clienteNome) && r.isAtiva()) {
                encontrada = r;
                break;
            }
        }
        if (encontrada == null) {
            throw new Exception("Reserva para " + clienteNome + " não encontrada.");
        }
        encontrada.cancelar();
        this.disponivel = true;
    }

    @Override
    public boolean estaDisponivel() {
        return disponivel;
    }


    @Override
    public void realizarManutencao(String descricao) {
        historicoManutencao.add("[" + LocalDate.now() + "] " + descricao);
        this.disponivel = false;
    }

    public void finalizarManutencao() {
        this.disponivel = true;
    }

    @Override
    public String getHistoricoManutencao() {
        if (historicoManutencao.isEmpty()) return "Nenhuma manutenção registrada.";
        StringBuilder sb = new StringBuilder();
        for (String m : historicoManutencao) {
            sb.append(m).append("\n");
        }
        return sb.toString();
    }

    @Override
    public boolean precisaManutencao() {
        return quilometragem >= KM_MANUTENCAO;
    }

    public void adicionarQuilometragem(int km) {
        this.quilometragem += km;
    }


    public void adicionarOpcional(String opcional) {
        opcionais.add(opcional); 
    }

    public void removerOpcional(String opcional) {
        opcionais.remove(opcional);
    }

    public boolean possuiOpcional(String opcional) {
        return opcionais.contains(opcional);
    }

    public Set<String> getOpcionais() {
        return opcionais;
    }

 

    public String getPlaca() { return placa; }
    public String getMarca() { return marca; }
    public String getModelo() { return modelo; }
    public int getAno() { return ano; }
    public double getPrecoDiaria() { return precoDiaria; }
    public void setPrecoDiaria(double precoDiaria) { this.precoDiaria = precoDiaria; }
    public boolean isDisponivel() { return disponivel; }
    public void setDisponivel(boolean disponivel) { this.disponivel = disponivel; }
    public int getQuilometragem() { return quilometragem; }
    public List<Reserva> getReservas() { return reservas; }

    @Override
    public String toString() {
        String opcionaisStr = opcionais.isEmpty() ? "Nenhum" : String.join(", ", opcionais);
        return "[" + getTipoVeiculo() + "] " + marca + " " + modelo +
               " (" + ano + ") - Placa: " + placa +
               " | Diária: R$" + String.format("%.2f", calcularCustoDiaria()) +
               " | Opcionais: " + opcionaisStr +
               " | " + (disponivel ? "Disponível" : "Indisponível");
    }
}
