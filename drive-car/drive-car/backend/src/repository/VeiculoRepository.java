package repository;

import exception.VeiculoIndisponivelException;
import model.Veiculo;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


public class VeiculoRepository {

    private Map<String, Veiculo> veiculos; 

    public VeiculoRepository() {
        this.veiculos = new HashMap<>();
    }

    public void salvar(Veiculo v) {
        veiculos.put(v.getPlaca(), v);
    }

    public Veiculo buscarPorPlaca(String placa) throws VeiculoIndisponivelException {
        Veiculo v = veiculos.get(placa);
        if (v == null) {
            throw new VeiculoIndisponivelException(placa, "Veículo com placa " + placa + " não cadastrado.");
        }
        return v;
    }

    public List<Veiculo> listarTodos() {
        return new ArrayList<>(veiculos.values());
    }

    public List<Veiculo> listarDisponiveis() {
        List<Veiculo> disponiveis = new ArrayList<>();
        for (Veiculo v : veiculos.values()) {
            if (v.estaDisponivel()) {
                disponiveis.add(v);
            }
        }
        return disponiveis;
    }

    public void remover(String placa) {
        veiculos.remove(placa);
    }

    public int totalCadastrados() {
        return veiculos.size();
    }
}
