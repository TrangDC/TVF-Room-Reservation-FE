function Loading() {
  return (
    <div className='flex items-center justify-center bg-slate-200 w-screen h-screen overflow-hidden'>
      <div
        className='inline-block h-14 w-14 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white'
        role='status'
      >
        <span className='!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]'></span>
      </div>
    </div>
  );
}

export default Loading;
