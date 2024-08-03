import Link from 'next/link';

const NotFound = () => {
  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='mb-6 text-4xl lg:text-5xl'>Oooops...</h1>
      <h2 className='mb-4 text-2xl lg:text-3xl'>That page cannot be found.</h2>
      <p className='text-xl'>
        Go back to the <Link href='/'>Homepage</Link>
        <button>Click me</button>
      </p>
    </div>
  );
};

export default NotFound;
