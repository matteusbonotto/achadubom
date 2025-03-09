// CRUD


export const ProductService = {
    getProductsData() {
        return [
            {
                id: '1',
                name: 'Mini Processador e Triturador',
                description: 'Prático para cortar alimentos.',
                image: 'https://down-br.img.susercontent.com/file/br-11134207-7r98o-m2xkt259ozpx6c@resize_w450_nl.webp',
                category: 'Eletrodomésticos',
                code: '2343mhdu',
                inventoryStatus: 'Em Alta',
                url: 'https://shopee.com.br/Mini-Processador-Triturador-Sem-Fio-El%C3%A9trico-250ML-De-Alimentos-Para-Legumes-Alho-Gengibre-i.832036467.18931705150?sp_atk=fee50e85-02ab-483e-84ff-a1f888dde8f6&uls_trackid=5260h6p600rd&utm_campaign=id_9b99iqODa4&utm_content=----&utm_medium=affiliates&utm_source=an_18305100467&utm_term=cojy1jxmqdbu&xptdk=fee50e85-02ab-483e-84ff-a1f888dde8f6',
                rating: 5
            },
            {
                id: '2',
                name: 'Ring Light',
                description: 'Ideal para criação de conteúdo.',
                image: 'https://down-br.img.susercontent.com/file/sg-11134201-7rbkw-lm7zonxpngrt26.webp',
                category: 'Iluminação',
                code: 'XPTO',
                inventoryStatus: 'Top',
                url: 'https://shopee.com.br/Ring-Light-Iluminador-10-Polegadas-Com-Trip%C3%A9-De-2.10-Metro-MarisaStore-i.400311012.9126540845?sp_atk=65990ad4-a3c9-47ae-9269-742331d5c096&uls_trackid=5260h6sd0056&utm_campaign=id_Gz9Dngww9g&utm_content=----&utm_medium=affiliates&utm_source=an_18305100467&utm_term=cojy1nr68t63&xptdk=65990ad4-a3c9-47ae-9269-742331d5c096',
                rating: 4
            },
            {
                id: '3',
                name: 'Air Fryer',
                description: 'Popular por promover alimentação saudável.',
                image: 'https://down-br.img.susercontent.com/file/sg-11134201-7rcez-lsacfljdq4ggd9@resize_w450_nl.webp',
                category: 'Eletrodomésticos',
                code: 'agdWf',
                inventoryStatus: 'Em Alta',
                url: 'https://shopee.com.br/Fritadeira-Air-Fryer-Brit%C3%A2nia-4-2L-1500W-BFR38-Dura-Mais-i.811879342.20199206047?sp_atk=345a7e8d-8c25-4ff0-9f1f-55633974bd70&uls_trackid=5260h6v10058&utm_campaign=id_ON9HsXVejI&utm_content=----&utm_medium=affiliates&utm_source=an_18305100467&utm_term=cojy1q1mkqqq&xptdk=345a7e8d-8c25-4ff0-9f1f-55633974bd70',
                rating: 5
            },
            {
                id: '4',
                name: 'Escova elétrica',
                description: 'Facilite a sua limpeza diária.',
                image: 'https://down-br.img.susercontent.com/file/br-11134207-7r98o-m1xawd2fn5s84e@resize_w450_nl.webp',
                category: 'Higiene Pessoal',
                code: 'SQG5',
                inventoryStatus: 'Achadinho',
                url: 'https://shopee.com.br/Escova-Eletrica-de-Limpeza-5-em-1-Sem-Fio-Limpador-Multiuso-Pratico-Para-Cozinha-Banheiro-pr%C3%A1tico-i.1060793149.22997970594?sp_atk=467512d6-5a58-4322-bc74-99c049c56f5a&uls_trackid=5260h72g01sa&utm_campaign=id_Vl9LxO4NIu&utm_content=----&utm_medium=affiliates&utm_source=an_18305100467&utm_term=cojy1t29ro8j&xptdk=467512d6-5a58-4322-bc74-99c049c56f5a',
                rating: 4
            }
        ];
    },

    getProductsMini() {
        return Promise.resolve(this.getProductsData().slice(0, 5));
    },

    getProductsSmall() {
        return Promise.resolve(this.getProductsData().slice(0, 10));
    },

    getProducts() {
        return Promise.resolve(this.getProductsData());
    }
};
