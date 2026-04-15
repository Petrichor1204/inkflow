import { useMemo } from "react"
import DiffMatchPatch from "diff-match-patch"

const dmp = new DiffMatchPatch()

function DiffViewer({ original, modified }) {
    const diffs = useMemo(() => {
        const d = dmp.diff_main(original, modified)
        dmp.diff_cleanupSemantic(d)
        return d
    }, [original, modified])

    return (
        <div style={{
            border: "1px solid #eee",
            borderRadius: 8,
            padding: "1.25rem",
            fontSize: 15,
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
            minHeight: 200
        }}>
            {diffs.map((diff, i) => {
                const [type, text] = diff
                if (type === 0) return <span key={i}>{text}</span>
                if (type === 1) return (
                    <span key={i} style={{
                        background: "#e6f4ea",
                        color: "#137333",
                        borderRadius: 2,
                        padding: "0 2px"
                    }}>
                        {text}
                    </span>
                )
                if (type === -1) return (
                    <span key={i} style={{
                        background: "#fce8e6",
                        color: "#c5221f",
                        textDecoration: "line-through",
                        borderRadius: 2,
                        padding: "0 2px"
                    }}>
                        {text}
                    </span>
                )
                return null
            })}
        </div>
    )
}

export default DiffViewer
