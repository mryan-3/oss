import Image from 'next/image'
import Link from 'next/link'

export default function HomePage() {
    return (
        <main className='flex flex-1 flex-col justify-center text-center'>
            <Hero />
            <Projects />
        </main>
    )
}

function Hero() {
    return (
        <section className='mx-4 flex flex-col gap-20 pb-14 pt-16 md:px-10 md:py-24 lg:flex-row lg:gap-2.5 lg:px-16 xl:px-20 2xl:px-52 '>
            <div className='relative z-10 flex h-full flex-1 flex-col items-start justify-center md:mx-auto md:items-center lg:items-start lg:text-center'>
                <header className='mx-auto  flex w-full flex-col justify-center md:items-center md:text-center lg:mx-0 lg:items-start lg:text-start'>
                    <p className='mx-auto mb-8 w-fit rounded-full border border-black bg-[#88aaee] px-3 text-black py-1 text-sm font-medium shadow-md md:mx-0 md:mb-2 md:shadow-none dark:border-purple-50'>
                        Zenetra OSS
                    </p>
                    <h1 className='scroll-m-20 text-center text-4xl font-extrabold tracking-tight md:text-5xl mt-2 text-black lg:text-start lg:text-6xl dark:text-gray-200'>
                        We love & Support Open Source
                    </h1>
                    <p className='mt-2 max-w-lg text-center text-lg lg:max-w-xl lg:text-start'>
                        At Zenetra Labs, we are passionate about open source
                        software. We believe in the power of open source
                        software to transform the world. We are committed to
                        supporting open source software projects and
                        communities.
                    </p>
                </header>

                <div className='mx-auto mt-8 flex justify-start md:mx-0'>
                    <Link
                        href='/docs'
                        className={
                            'text-lg border-2 border-black py-2 px-6 bg-[#88aaee] hover:opacity-90 text-black active:opacity-100 hover:border-1 dark:border-purple-50'
                        }
                    >
                        See our projects
                    </Link>
                </div>
            </div>

            <div className='max-w-xm h-full flex-1 border-2 border-black dark:border-purple-50'>
                <div className='group relative col-span-6 row-span-2 flex h-fit flex-col overflow-hidden bg-[#88aaee] bg-no-repeat text-black transition-all md:h-[32.1rem] lg:h-[30rem] 2xl:h-[32rem]'>
                    <div className='z-10 flex h-full flex-1 flex-col px-4 pt-4 2xl:px-8 2xl:py-8'>
                        <h2 className='whitespace-pre-line text-center text-[1.8rem] font-medium md:text-start md:text-[2.375rem] md:leading-[1.3] 2xl:text-4xl'>
                            With you every step of the way
                        </h2>
                        <p className='ml-1 text-start max-w-md text-base'>
                            We walk with you from the idea stage to the launch
                            stage. We will help you build a product that scales
                            and grows with your business.
                        </p>
                        <ul className='ml-8 mt-4 list-inside list-disc text-start space-y-2 text-xl font-medium'>
                            <li>Idea &amp; Conceptualization</li>
                            <li>Requirement Gathering</li>
                            <li>Design &amp; Prototyping</li>
                            <li>Development &amp; Testing</li>
                            <li>Deployment &amp; Launch</li>
                            <li>Maintenance &amp; Support</li>
                        </ul>
                    </div>

                    <div className='-mb-32 -ml-6 md:-mr-20 md:-mt-40 md:-rotate-12 xl:-mt-24 xl:ml-8 2xl:-mr-20 2xl:-mt-44'>
                        <Image
                            src='/hero_image.png'
                            alt='Hero image'
                            width={980}
                            height={883}
                            className='object-cover '
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
const OSSProjects = [
    {
        title: 'NodeJs Mpesa SDK',
        image: '/mpesa_api.png',
        link: '/docs/mpesa',
        description: (
            <>
                A simple SDK to help you integrate Mpesa into your application.
                With great documentation and support, you can get started in
                minutes.
            </>
        )
    }
]

function Projects() {
    return (
        <section className='mx-4 flex flex-col gap-20 md:px-10 pb-32 lg:gap-2.5 lg:px-16 xl:px-20 2xl:px-52 '>
            <h2 className='text-2xl font-semibold tracking-tight md:text-4xl mt-2 text-black lg:text-start dark:text-gray-200'>
                Our Projects
            </h2>

            <div className='grid mt-6 grid-cols-1 md:grid-cols-3 2xl:grid-cols-4'>
                {OSSProjects.map((project, index) => (
                    <Link
                        href={project.link}
                        key={'projects_' + index}
                        className='flex divide-y flex-col gap-4 border-2 hover:opacity-80 border-black bg-white dark:bg-gray-800 dark:border-purple-800/20 dark:divide-black'
                    >
                        <div className='p-4'>
                            <Image
                                src={project.image}
                                alt={project.title}
                                width={500}
                                height={500}
                                className='object-cover'
                            />
                        </div>

                        <div className='pb-4 px-4'>
                            <h3 className='text-lg text-start font-semibold text-black dark:text-gray-200'>
                                {project.title}
                            </h3>
                            <p className='text-start line-clamp-4 text-sm mt-2'>
                                {project.description}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}
