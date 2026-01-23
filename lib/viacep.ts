export interface ViaCepResponse {
    cep: string;
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string;
    uf: string;
    ibge: string;
    gia: string;
    ddd: string;
    siafi: string;
    erro?: boolean;
}

export async function fetchAddressByCep(cep: string): Promise<{ success: boolean; data?: ViaCepResponse; error?: string }> {
    const cleanCep = cep.replace(/\D/g, '');

    if (cleanCep.length !== 8) {
        return { success: false, error: 'CEP deve ter 8 dígitos.' };
    }

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();

        if (data.erro) {
            return { success: false, error: 'CEP não encontrado.' };
        }

        return { success: true, data };
    } catch (error) {
        return { success: false, error: 'Erro ao buscar CEP.' };
    }
}
