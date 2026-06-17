package service;

import exception.ClienteNaoEncontradoException;
import exception.ReservaNaoEncontradaException;
import exception.VeiculoIndisponivelException;
import model.*;
import repository.ClienteRepository;
import repository.ReservaRepository;
import repository.VeiculoRepository;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;


public class LocadoraService {

    private VeiculoRepository veiculoRepo;
    private ClienteRepository clienteRepo;
    private ReservaRepository reservaRepo;
    private Set<String> cpfsClientesComReserva; 
    public LocadoraService() {
        this.veiculoRepo = new VeiculoRepository();
        this.clienteRepo = new ClienteRepository();
        this.reservaRepo = new ReservaRepository();
        this.cpfsClientesComReserva = new HashSet<>();
    }



    public void cadastrarVeiculo(Veiculo v) {
        try {
            veiculoRepo.salvar(v);
            System.out.println("✅ Veículo cadastrado: " + v.getPlaca());
        } catch (Exception e) {
            System.err.println("❌ Erro ao cadastrar veículo: " + e.getMessage());
        } finally {
            System.out.println("   [cadastrarVeiculo finalizado]");
        }
    }

    public List<Veiculo> listarVeiculosDisponiveis() {
        return veiculoRepo.listarDisponiveis();
    }

    public List<Veiculo> listarTodosVeiculos() {
        return veiculoRepo.listarTodos();
    }



    public void cadastrarCliente(Cliente c) {
        try {
            clienteRepo.salvar(c);
            System.out.println("✅ Cliente cadastrado: " + c.getNome());
        } catch (Exception e) {
            System.err.println("❌ Erro ao cadastrar cliente: " + e.getMessage());
        }
    }

    public Cliente buscarCliente(String cpf) throws ClienteNaoEncontradoException {
        return clienteRepo.buscarPorCpf(cpf);
    }



    public Reserva fazerReserva(String cpfCliente, String placaVeiculo,
                                LocalDate inicio, LocalDate fim)
            throws VeiculoIndisponivelException, ClienteNaoEncontradoException {

        Reserva reserva = null;
        try {
            Cliente cliente = clienteRepo.buscarPorCpf(cpfCliente);
            Veiculo veiculo = veiculoRepo.buscarPorPlaca(placaVeiculo);

            if (!veiculo.estaDisponivel()) {
                throw new VeiculoIndisponivelException(placaVeiculo);
            }

            veiculo.reservar(cliente.getNome(), inicio, fim);
            reserva = veiculo.getReservas().get(veiculo.getReservas().size() - 1);
            reservaRepo.salvar(reserva);
            cliente.adicionarReserva(reserva);
            cpfsClientesComReserva.add(cpfCliente);

            System.out.println("✅ Reserva realizada com sucesso! " + reserva);

        } catch (VeiculoIndisponivelException | ClienteNaoEncontradoException e) {
            System.err.println("❌ Erro na reserva: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.err.println("❌ Erro inesperado: " + e.getMessage());
        } finally {
            System.out.println("   [fazerReserva finalizado]");
        }
        return reserva;
    }

    public void cancelarReserva(int idReserva) throws ReservaNaoEncontradaException {
        try {
            Reserva reserva = reservaRepo.buscarPorId(idReserva);
            reserva.getVeiculo().cancelarReserva(reserva.getClienteNome());
            System.out.println("✅ Reserva #" + idReserva + " cancelada.");
        } catch (ReservaNaoEncontradaException e) {
            System.err.println("❌ " + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.err.println("❌ Erro ao cancelar reserva: " + e.getMessage());
        } finally {
            System.out.println("   [cancelarReserva finalizado]");
        }
    }



    public void enviarParaManutencao(String placa, String descricao)
            throws VeiculoIndisponivelException {
        try {
            Veiculo v = veiculoRepo.buscarPorPlaca(placa);
            v.realizarManutencao(descricao);
            System.out.println("🔧 Veículo " + placa + " enviado para manutenção.");
        } catch (VeiculoIndisponivelException e) {
            System.err.println("❌ " + e.getMessage());
            throw e;
        } finally {
            System.out.println("   [enviarParaManutencao finalizado]");
        }
    }

    public void finalizarManutencao(String placa) throws VeiculoIndisponivelException {
        try {
            Veiculo v = veiculoRepo.buscarPorPlaca(placa);
            v.finalizarManutencao();
            System.out.println("✅ Manutenção finalizada para o veículo " + placa);
        } catch (VeiculoIndisponivelException e) {
            System.err.println("❌ " + e.getMessage());
            throw e;
        }
    }


    public int totalClientesUnicosComReserva() {
        return cpfsClientesComReserva.size();
    }

    public void exibirRelatorio() {
        System.out.println("\n========= RELATÓRIO DA LOCADORA =========");
        System.out.println("Total de veículos: " + veiculoRepo.totalCadastrados());
        System.out.println("Disponíveis: " + veiculoRepo.listarDisponiveis().size());
        System.out.println("Total de reservas: " + reservaRepo.totalReservas());
        System.out.println("Reservas ativas: " + reservaRepo.listarAtivas().size());
        System.out.println("Clientes únicos com reserva: " + totalClientesUnicosComReserva());

        System.out.println("\n--- Frota Completa ---");

        for (Veiculo v : veiculoRepo.listarTodos()) {
            System.out.println(v);
        }

        System.out.println("\n--- Reservas Ativas ---");
        for (Reserva r : reservaRepo.listarAtivas()) {
            System.out.println(r);
        }
        System.out.println("=========================================\n");
    }


    public VeiculoRepository getVeiculoRepo() { return veiculoRepo; }
    public ClienteRepository getClienteRepo() { return clienteRepo; }
    public ReservaRepository getReservaRepo() { return reservaRepo; }
}
