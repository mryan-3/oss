import clsx from 'clsx'
import Heading from '@theme/Heading'
import styles from './styles.module.css'
import Link from '@docusaurus/Link'

type FeatureItem = {
    title: string
    image: string
    description: JSX.Element
}

const FeatureList: FeatureItem[] = [
    {
        title: 'Mpesa SDK',
        image: '/img/mpesa_api.png',
        description: <>A simple SDK to help you integrate Mpesa into your application. With great documentation and support, you can get started in minutes.</>
    }
]

function Feature({ title, image, description }: FeatureItem) {
    return (
        <Link href='/docs/mpesa' className={clsx('col col--4 border text-black hover:text-black hover:opacity-80 hover:no-underline bg-slate-100')}>
            <div className='text--center'>
                <img src={image} alt={title} className='padding-vert--md' />
            </div>
            <div className='text--center padding-horiz--md'>
                <Heading as='h3'>{title}</Heading>
                <p>{description}</p>
            </div>
        </Link>
    )
}

export default function HomepageFeatures(): JSX.Element {
    return (
        <section id='projects' className={clsx(styles.features, 'flex flex-col')}>
            <h2 className='font-semibold text-4xl text-start mr-auto container my-8'>🧰 Projects</h2>
            <hr className='container mb-8 bg-gray-200'/>
            <div className='container'>
                <div className='row'>
                    {FeatureList.map((props, idx) => (
                        <Feature key={idx} {...props} />
                    ))}
                </div>
            </div>
        </section>
    )
}
