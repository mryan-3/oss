import clsx from 'clsx'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import HomepageFeatures from '@site/src/components/HomepageFeatures'
import Heading from '@theme/Heading'

import styles from './index.module.css'

function HomepageHeader() {
    const { siteConfig } = useDocusaurusContext()
    return (
        <header className={clsx('flex flex-row bg-slate-100 justify-center gap-24', styles.heroBanner)}>
            <div className='max-w-[600px] mt-12'>
                <Heading as='h1' className='hero__title text-6xl text-start'>
                    {siteConfig.title}
                </Heading>
                <p className='font-medium text-3xl text-start'>Your Partner in All Matters Software</p>
                <p className='text-start text-lg'>
                    Bring your ideas to market. From your product's concept to launch, we've got you covered. We build software that scales and grows with your business.
                </p>
                <div className={clsx('flex items-start')}>
                    <Link to='https://zenetralabs.com' target='_blank' className='bg-zenetra text-white hover:opacity-80 hover:text-white font-medium px-8 py-3 text-lg rounded-md'>
                        Visit the Labs
                    </Link>
                </div>
            </div>

            <img src={'/img/steps.png'} alt={'zenetra labs image'} className='max-w-[500px]' />
        </header>
    )
}

export default function Home(): JSX.Element {
    const { siteConfig } = useDocusaurusContext()
    return (
        <Layout title={`${siteConfig.title}`} description='Description will go into a meta tag in <head />'>
            <HomepageHeader />
            <main>
                <HomepageFeatures />
            </main>
        </Layout>
    )
}
