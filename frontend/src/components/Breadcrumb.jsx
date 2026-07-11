import { Link } from "react-router-dom"

export default function Breadcrumb({ items }) {
    return (
        <p className="breadcrumb">
            {items.map((item, i) => (
                <span key={i}>
                    {i > 0 && " › "}
                    {item.to ? <Link to={item.to}>{item.label}</Link> : item.label}
                </span>
            ))}
        </p>
    )
}
