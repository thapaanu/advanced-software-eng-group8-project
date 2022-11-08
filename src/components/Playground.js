export default function Playground({ data = [] }) {
  return data.map((item, itemIndex) => {
    return (
      <div className="blocks-wrapper" key={itemIndex}>
        {item.map((block, blockIndex) => {
          return (
            <div
              className={
                block === 1
                  ? "white-block"
                  : block === 2
                  ? "pink-block"
                  : "block"
              }
              key={itemIndex + blockIndex}
            ></div>
          );
        })}
      </div>
    );
  });
}
