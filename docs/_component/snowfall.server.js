const data = [6, 5, 2, 4.5, 1.5, 2.5, 2, 2.5, 1.5, 2.5, 3.5, 7]

export function Chart(props) {
  return (
    <div className="snowfall">
      {data.map((d, i) => (
        <div
          key={i}
          className="snowfall-bar"
          style={{
            height: 'calc(' + d + ' * 0.5 * (1em + 1ex))',
            backgroundColor: props.color
          }}
        />
      ))}
    </div>
  )
}
