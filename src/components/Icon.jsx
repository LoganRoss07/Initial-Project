const paths = {
    home: (
        <>
            <path d="M3 11l9-8 9 8" />
            <path d="M5 10v10h14V10" />
        </>
    ),
    workouts: (
        <>
            <path d="M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12" />
        </>
    ),
    meals: (
        <>
            <path d="M6 3v7a2 2 0 0 0 4 0V3M8 10v11" />
            <path d="M17 3c-2 2-3 5-3 8h3v10" />
        </>
    ),
    progress: (
        <>
            <polyline points="3 17 9 11 13 15 21 7" />
            <polyline points="15 7 21 7 21 13" />
        </>
    ),
    settings: (
        <>
            <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
            <circle cx="16" cy="7" r="2" />
            <circle cx="8" cy="17" r="2" />
        </>
    ),
}

function Icon({ name }) {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {paths[name]}
        </svg>
    )
}

export default Icon