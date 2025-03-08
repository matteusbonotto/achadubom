export const ProductService = {
    getProductsData() {
        return [
            {
                id: '1',
                name: 'Mini Processador e Triturador',
                description: 'Prático para cortar alimentos.',
                image: 'https://down-br.img.susercontent.com/file/br-11134207-7r98o-m2xkt259ozpx6c@resize_w450_nl.webp',
                price: '?',
                category: 'Eletrodomésticos',
                code: 'XPT3',
                inventoryStatus: 'Em Alta',
                rating: 5
            },
            {
                id: '2',
                name: 'Ring Light',
                description: 'Ideal para criação de conteúdo.',
                image: 'https://down-br.img.susercontent.com/file/sg-11134201-7rbkw-lm7zonxpngrt26.webp',
                price: '?',
                category: 'Iluminação',
                code: 'XPTO',
                inventoryStatus: 'Top',
                rating: 4
            },
            {
                id: '3',
                name: 'Air Fryer',
                description: 'Popular por promover alimentação saudável.',
                image: 'https://down-br.img.susercontent.com/file/sg-11134201-7rcez-lsacfljdq4ggd9@resize_w450_nl.webp',
                price: '?',
                category: 'Eletrodomésticos',
                code: 'agdWf',
                inventoryStatus: 'Em Alta',
                rating: 5
            },
            {
                id: '4',
                name: 'Escova elétrica',
                description: 'Facilite a sua limpeza diária.',
                image: 'https://down-br.img.susercontent.com/file/br-11134207-7r98o-m1xawd2fn5s84e@resize_w450_nl.webp',
                price: '?',
                category: 'Higiene Pessoal',
                code: 'SQG5',
                inventoryStatus: 'Achadinho',
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
