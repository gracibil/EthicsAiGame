const TitleScreen = ({ onStart }) => {
    return (
      <div className="text-center flex flex-col items-center justify-center h-full py-10 my-auto">
        <h1 className="text-4xl text-cyan-300 font-bold mb-12 tracking-widest uppercase animate-pulse drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">
        {"<< The Exodus ?>>"}
        </h1>
        <button 
          onClick={onStart} 
          className='px-8 py-4 bg-cyan-900/30 border border-cyan-500/50 hover:bg-cyan-800/50 hover:border-cyan-400 rounded-lg transition-all shadow-[0_0_15px_rgba(0,255,255,0.1)] hover:shadow-[0_0_25px_rgba(0,255,255,0.2)]'
        >
          <p className="font-bold text-cyan-100 text-xl tracking-wider uppercase">Initialize System</p>
        </button>
      </div>
    )
  }
  
  export default TitleScreen;