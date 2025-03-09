
import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Galleria } from 'primereact/galleria';
import { GalleriaService } from '../../Services/GalleriaService';

export default function WithThumbnailsDemo() {
    const [images, setImages] = useState(null);
    const galleria = useRef(null);

    const responsiveOptions = [
        {
            breakpoint: '1500px',
            numVisible: 5
        },
        {
            breakpoint: '1024px',
            numVisible: 3
        },
        {
            breakpoint: '768px',
            numVisible: 2
        },
        {
            breakpoint: '560px',
            numVisible: 1
        }
    ];

    useEffect(() => {
        GalleriaService.getImages().then(data => setImages(data));
    }, []);

    const itemTemplate = (item) => {
        return <img src={item.itemImageSrc} alt={item.alt} style={{ width: '100%', display: 'block' }} />;
    }

    const thumbnailTemplate = (item) => {
        return <img src={item.thumbnailImageSrc} alt={item.alt} style={{ display: 'block' }} />;
    }

    return (
        <div className="card flex justify-content-center">
            <Galleria ref={galleria} value={images} responsiveOptions={responsiveOptions} numVisible={9} style={{ maxWidth: '50%' }} 
                circular fullScreen showItemNavigators item={itemTemplate} thumbnail={thumbnailTemplate} />

            <Button label="Show" icon="pi pi-external-link" onClick={() => galleria.current.show()} />
        </div>
    )
}
        