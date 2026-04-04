import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img src="/logo.svg" alt="Kuriftu" className='size-12' {...props} />
    );
}
