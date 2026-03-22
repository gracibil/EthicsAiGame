const TextWindow = ({ scenario, className}) => {
    return (
        <div className={className}>
            <h2 className="text-2xl font-bold mb-4">{scenario.title}</h2>
            <p>{scenario.description}</p>
        </div>
    )
}

export default TextWindow;