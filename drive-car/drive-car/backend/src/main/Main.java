package main;

import exception.ClienteNaoEncontradoException;
import exception.ReservaNaoEncontradaException;
import exception.VeiculoIndisponivelException;
import model.*;
import service.LocadoraService;
import util.FormatadorUtil;

import java.time.LocalDate;
import java.util.List;
import java.util.Scanner;

public class Main {

    private static final Scanner sc = new Scanner(System.in);
    private static final LocadoraService locadora = new LocadoraService();

    public static void main(String[] args) {
        FormatadorUtil.imprimirTitulo("Drive Car — Sistema de Locação de Veículos");

        int opcao = -1;
        while (opcao != 0) {
            exibirMenu();
            opcao = lerInt("Escolha uma opção: ");
            executar(opcao);
        }

        System.out.println("\nEncerrando o sistema. Até logo!");
    }

    private static void exibirMenu() {
        System.out.println("\n============== MENU PRINCIPAL ==============");
        System.out.println("  1  - Cadastrar veículo");
        System.out.println("  2  - Listar todos os veículos");
        System.out.println("  3  - Listar veículos disponíveis");
        System.out.println("  4  - Adicionar opcional a um veículo");
        System.out.println("  5  - Remover opcional de um veículo");
        System.out.println("  6  - Recarregar carro elétrico");
        System.out.println("  7  - Registrar quilometragem");
        System.out.println("  8  - Cadastrar cliente");
        System.out.println("  9  - Listar clientes");
        System.out.println(" 10  - Fazer reserva");
        System.out.println(" 11  - Cancelar reserva");
        System.out.println(" 12  - Listar reservas");
        System.out.println(" 13  - Enviar veículo para manutenção");
        System.out.println(" 14  - Finalizar manutenção");
        System.out.println(" 15  - Ver histórico de manutenção");
        System.out.println(" 16  - Exibir relatório geral");
        System.out.println(" 17  - Carregar dados de exemplo");
        System.out.println("  0  - Sair");
        System.out.println("============================================");
    }

    private static void executar(int opcao) {
        switch (opcao) {
            case 1: cadastrarVeiculo(); break;
            case 2: listarTodosVeiculos(); break;
            case 3: listarVeiculosDisponiveis(); break;
            case 4: adicionarOpcional(); break;
            case 5: removerOpcional(); break;
            case 6: recarregarEletrico(); break;
            case 7: registrarQuilometragem(); break;
            case 8: cadastrarCliente(); break;
            case 9: listarClientes(); break;
            case 10: fazerReserva(); break;
            case 11: cancelarReserva(); break;
            case 12: listarReservas(); break;
            case 13: enviarManutencao(); break;
            case 14: finalizarManutencao(); break;
            case 15: historicoManutencao(); break;
            case 16: locadora.exibirRelatorio(); break;
            case 17: carregarDadosExemplo(); break;
            case 0: break;
            default: System.out.println("Opção inválida. Tente novamente.");
        }
    }

    private static void cadastrarVeiculo() {
        FormatadorUtil.imprimirTitulo("Cadastro de Veículo");
        System.out.println("Tipos: 1-Carro  2-Carro Elétrico  3-Caminhão  4-Caminhão Pesado");
        int tipo = lerInt("Tipo do veículo: ");
        if (tipo < 1 || tipo > 4) {
            System.out.println("Tipo inválido.");
            return;
        }

        String placa = lerTexto("Placa: ");
        String marca = lerTexto("Marca: ");
        String modelo = lerTexto("Modelo: ");
        int ano = lerInt("Ano: ");
        double preco = lerDouble("Preço da diária (R$): ");

        Veiculo veiculo = null;
        switch (tipo) {
            case 1: {
                int portas = lerInt("Número de portas: ");
                String comb = lerTexto("Combustível (Flex/Gasolina/Diesel): ");
                veiculo = new Carro(placa, marca, modelo, ano, preco, portas, comb);
                break;
            }
            case 2: {
                int portas = lerInt("Número de portas: ");
                int autonomia = lerInt("Autonomia (km): ");
                veiculo = new CarroEletrico(placa, marca, modelo, ano, preco, portas, autonomia);
                break;
            }
            case 3: {
                double carga = lerDouble("Capacidade de carga (toneladas): ");
                int eixos = lerInt("Número de eixos: ");
                veiculo = new Caminhao(placa, marca, modelo, ano, preco, carga, eixos);
                break;
            }
            case 4: {
                double carga = lerDouble("Capacidade de carga (toneladas): ");
                int eixos = lerInt("Número de eixos: ");
                boolean refrig = lerSimNao("Possui refrigeração? (s/n): ");
                int reboques = lerInt("Número de reboques: ");
                veiculo = new CaminhaoPesado(placa, marca, modelo, ano, preco, carga, eixos, refrig, reboques);
                break;
            }
        }

        if (veiculo != null) {
            locadora.cadastrarVeiculo(veiculo);
            System.out.println("Diária calculada: " + FormatadorUtil.formatarMoeda(veiculo.calcularCustoDiaria()));
        }
    }

    private static void listarTodosVeiculos() {
        FormatadorUtil.imprimirTitulo("Todos os Veículos");
        List<Veiculo> lista = locadora.listarTodosVeiculos();
        if (lista.isEmpty()) {
            System.out.println("Nenhum veículo cadastrado.");
            return;
        }
        for (Veiculo v : lista) {
            System.out.println(v);
        }
    }

    private static void listarVeiculosDisponiveis() {
        FormatadorUtil.imprimirTitulo("Veículos Disponíveis");
        List<Veiculo> lista = locadora.listarVeiculosDisponiveis();
        if (lista.isEmpty()) {
            System.out.println("Nenhum veículo disponível.");
            return;
        }
        for (Veiculo v : lista) {
            System.out.println(v);
        }
    }

    private static void adicionarOpcional() {
        FormatadorUtil.imprimirTitulo("Adicionar Opcional");
        String placa = lerTexto("Placa do veículo: ");
        try {
            Veiculo v = locadora.getVeiculoRepo().buscarPorPlaca(placa);
            String opcional = lerTexto("Opcional: ");
            v.adicionarOpcional(opcional);
            System.out.println("Opcional adicionado. Opcionais atuais: " + v.getOpcionais());
        } catch (VeiculoIndisponivelException e) {
            System.out.println("❌ " + e.getMessage());
        }
    }

    private static void removerOpcional() {
        FormatadorUtil.imprimirTitulo("Remover Opcional");
        String placa = lerTexto("Placa do veículo: ");
        try {
            Veiculo v = locadora.getVeiculoRepo().buscarPorPlaca(placa);
            System.out.println("Opcionais atuais: " + v.getOpcionais());
            String opcional = lerTexto("Opcional a remover: ");
            v.removerOpcional(opcional);
            System.out.println("Opcionais após remoção: " + v.getOpcionais());
        } catch (VeiculoIndisponivelException e) {
            System.out.println("❌ " + e.getMessage());
        }
    }

    private static void recarregarEletrico() {
        FormatadorUtil.imprimirTitulo("Recarregar Carro Elétrico");
        String placa = lerTexto("Placa do carro elétrico: ");
        try {
            Veiculo v = locadora.getVeiculoRepo().buscarPorPlaca(placa);
            if (v instanceof CarroEletrico) {
                ((CarroEletrico) v).recarregar();
            } else {
                System.out.println("Esse veículo não é um carro elétrico.");
            }
        } catch (VeiculoIndisponivelException e) {
            System.out.println("❌ " + e.getMessage());
        }
    }

    private static void registrarQuilometragem() {
        FormatadorUtil.imprimirTitulo("Registrar Quilometragem");
        String placa = lerTexto("Placa do veículo: ");
        try {
            Veiculo v = locadora.getVeiculoRepo().buscarPorPlaca(placa);
            int km = lerInt("Quilômetros rodados: ");
            v.adicionarQuilometragem(km);
            System.out.println("Quilometragem total: " + v.getQuilometragem() + " km");
            if (v.precisaManutencao()) {
                System.out.println("⚠️  Atenção: este veículo já precisa de manutenção!");
            } else {
                System.out.println("Veículo dentro do limite de manutenção.");
            }
        } catch (VeiculoIndisponivelException e) {
            System.out.println("❌ " + e.getMessage());
        }
    }

    private static void cadastrarCliente() {
        FormatadorUtil.imprimirTitulo("Cadastro de Cliente");
        String nome = lerTexto("Nome: ");
        String cpf = lerTexto("CPF: ");
        String tel = lerTexto("Telefone: ");
        String email = lerTexto("E-mail: ");
        Cliente c = new Cliente(nome, cpf, tel, email);
        locadora.cadastrarCliente(c);
    }

    private static void listarClientes() {
        FormatadorUtil.imprimirTitulo("Clientes Cadastrados");
        List<Cliente> lista = locadora.getClienteRepo().listarTodos();
        if (lista.isEmpty()) {
            System.out.println("Nenhum cliente cadastrado.");
            return;
        }
        for (Cliente c : lista) {
            System.out.println(c);
        }
    }

    private static void fazerReserva() {
        FormatadorUtil.imprimirTitulo("Nova Reserva");
        String cpf = lerTexto("CPF do cliente: ");
        String placa = lerTexto("Placa do veículo: ");
        int dias = lerInt("Quantidade de diárias: ");
        if (dias < 1) {
            System.out.println("A reserva precisa ter pelo menos 1 diária.");
            return;
        }
        LocalDate inicio = LocalDate.now();
        LocalDate fim = inicio.plusDays(dias);
        System.out.println("Período: " + FormatadorUtil.formatarData(inicio) + " até " + FormatadorUtil.formatarData(fim));
        try {
            locadora.fazerReserva(cpf, placa, inicio, fim);
        } catch (VeiculoIndisponivelException | ClienteNaoEncontradoException e) {
            System.out.println("❌ Não foi possível concluir a reserva.");
        }
    }

    private static void cancelarReserva() {
        FormatadorUtil.imprimirTitulo("Cancelar Reserva");
        int id = lerInt("ID da reserva: ");
        try {
            locadora.cancelarReserva(id);
        } catch (ReservaNaoEncontradaException e) {
            System.out.println("❌ " + e.getMessage());
        }
    }

    private static void listarReservas() {
        FormatadorUtil.imprimirTitulo("Reservas");
        System.out.println("1-Todas   2-Somente ativas   3-Por cliente");
        int op = lerInt("Opção: ");
        List<Reserva> lista;
        if (op == 2) {
            lista = locadora.getReservaRepo().listarAtivas();
        } else if (op == 3) {
            String nome = lerTexto("Nome do cliente: ");
            lista = locadora.getReservaRepo().listarPorCliente(nome);
        } else {
            lista = locadora.getReservaRepo().listarTodas();
        }
        if (lista.isEmpty()) {
            System.out.println("Nenhuma reserva encontrada.");
            return;
        }
        for (Reserva r : lista) {
            System.out.println(r);
        }
    }

    private static void enviarManutencao() {
        FormatadorUtil.imprimirTitulo("Enviar para Manutenção");
        String placa = lerTexto("Placa do veículo: ");
        String desc = lerTexto("Descrição do serviço: ");
        try {
            locadora.enviarParaManutencao(placa, desc);
        } catch (VeiculoIndisponivelException e) {
            System.out.println("❌ " + e.getMessage());
        }
    }

    private static void finalizarManutencao() {
        FormatadorUtil.imprimirTitulo("Finalizar Manutenção");
        String placa = lerTexto("Placa do veículo: ");
        try {
            locadora.finalizarManutencao(placa);
        } catch (VeiculoIndisponivelException e) {
            System.out.println("❌ " + e.getMessage());
        }
    }

    private static void historicoManutencao() {
        FormatadorUtil.imprimirTitulo("Histórico de Manutenção");
        String placa = lerTexto("Placa do veículo: ");
        try {
            Veiculo v = locadora.getVeiculoRepo().buscarPorPlaca(placa);
            System.out.println(v.getHistoricoManutencao());
        } catch (VeiculoIndisponivelException e) {
            System.out.println("❌ " + e.getMessage());
        }
    }

    private static void carregarDadosExemplo() {
        FormatadorUtil.imprimirTitulo("Carregando Dados de Exemplo");

        Carro carro1 = new Carro("ABC-1234", "Toyota", "Corolla", 2023, 150.0, 4, "Flex");
        Carro carro2 = new Carro("DEF-5678", "Honda", "Civic", 2022, 170.0, 4, "Gasolina");
        CarroEletrico eletrico = new CarroEletrico("ELE-0001", "Tesla", "Model 3", 2024, 250.0, 4, 500);
        Caminhao caminhao = new Caminhao("CAM-9999", "Volvo", "FH540", 2021, 400.0, 25.0, 6);
        CaminhaoPesado pesado = new CaminhaoPesado("CPE-7777", "Scania", "R450", 2020, 500.0, 40.0, 8, true, 2);

        carro1.adicionarOpcional("Ar-condicionado");
        carro1.adicionarOpcional("GPS");
        eletrico.adicionarOpcional("Piloto automático");
        eletrico.adicionarOpcional("Teto solar");

        locadora.cadastrarVeiculo(carro1);
        locadora.cadastrarVeiculo(carro2);
        locadora.cadastrarVeiculo(eletrico);
        locadora.cadastrarVeiculo(caminhao);
        locadora.cadastrarVeiculo(pesado);

        locadora.cadastrarCliente(new Cliente("Ana Silva", "111.111.111-11", "(11) 91111-1111", "ana@email.com"));
        locadora.cadastrarCliente(new Cliente("Bruno Costa", "222.222.222-22", "(11) 92222-2222", "bruno@email.com"));

        System.out.println("Dados de exemplo carregados com sucesso!");
    }

    private static String lerTexto(String prompt) {
        System.out.print(prompt);
        String linha = sc.nextLine().trim();
        while (linha.isEmpty()) {
            System.out.print("O valor não pode ser vazio. " + prompt);
            linha = sc.nextLine().trim();
        }
        return linha;
    }

    private static int lerInt(String prompt) {
        while (true) {
            System.out.print(prompt);
            String linha = sc.nextLine().trim();
            try {
                return Integer.parseInt(linha);
            } catch (NumberFormatException e) {
                System.out.println("Digite um número inteiro válido.");
            }
        }
    }

    private static double lerDouble(String prompt) {
        while (true) {
            System.out.print(prompt);
            String linha = sc.nextLine().trim().replace(",", ".");
            try {
                return Double.parseDouble(linha);
            } catch (NumberFormatException e) {
                System.out.println("Digite um número válido.");
            }
        }
    }

    private static boolean lerSimNao(String prompt) {
        System.out.print(prompt);
        String linha = sc.nextLine().trim().toLowerCase();
        return linha.startsWith("s");
    }
}
