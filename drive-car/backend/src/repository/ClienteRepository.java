package repository;

import exception.ClienteNaoEncontradoException;
import model.Cliente;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


public class ClienteRepository {

    private Map<String, Cliente> clientes;
    public ClienteRepository() {
        this.clientes = new HashMap<>();
    }

    public void salvar(Cliente c) {
        clientes.put(c.getCpf(), c);
    }

    public Cliente buscarPorCpf(String cpf) throws ClienteNaoEncontradoException {
        Cliente c = clientes.get(cpf);
        if (c == null) {
            throw new ClienteNaoEncontradoException("CPF: " + cpf);
        }
        return c;
    }

    public Cliente buscarPorNome(String nome) throws ClienteNaoEncontradoException {
        for (Cliente c : clientes.values()) {
            if (c.getNome().equalsIgnoreCase(nome)) return c;
        }
        throw new ClienteNaoEncontradoException("Nome: " + nome);
    }

    public List<Cliente> listarTodos() {
        return new ArrayList<>(clientes.values());
    }

    public void remover(String cpf) {
        clientes.remove(cpf);
    }
}
