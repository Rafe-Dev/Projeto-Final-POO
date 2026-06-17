package model;


public interface Manutencao {
    void realizarManutencao(String descricao);
    String getHistoricoManutencao();
    boolean precisaManutencao();
}
