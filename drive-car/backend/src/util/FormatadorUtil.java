package util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;


public class FormatadorUtil {

    private static final DateTimeFormatter FORMATO_BR = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    public static final String SEPARADOR = "─".repeat(50);

    private FormatadorUtil() {} 

    public static String formatarData(LocalDate data) {
        return data.format(FORMATO_BR);
    }

    public static String formatarMoeda(double valor) {
        return String.format("R$ %.2f", valor);
    }

    public static void imprimirTitulo(String titulo) {
        System.out.println("\n" + SEPARADOR);
        System.out.println("  " + titulo.toUpperCase());
        System.out.println(SEPARADOR);
    }
}
