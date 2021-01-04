import React, { useState, useEffect } from 'react'

interface IProps {
  tip: string,
  pathRef: React.RefObject<SVGElement>,
  svgRef: React.RefObject<SVGSVGElement>,
  minWidth?: number,
  fontSize?: number,
  fontFamily?: string,
  bgColor?: string,
  textColor?: string
}

export const PathTooltip: React.FC<IProps> = (props) => {

  // set initial state
  const [hidden, setHidden] = useState(true)
  const [tooltipRect, setTooltipRect] = useState({ x: 0, y: 0, w:0, h:0, isLeft: false, isTop: false })
  const [fontSize, ] = useState (props["fontSize"] || 12)
  const [fontFamily, ] = useState (props["fontFamily"] || "sans-serif")
  const [bgColor, ] = useState (props["bgColor"] || "black")
  const [textColor, ] = useState (props["textColor"] || "white")
  const pathRef = props.pathRef
  const svgRef = props.svgRef
  const textRef = React.createRef<SVGTextElement>()

  // use effect to handle mouse over and mouse leave
  useEffect(() => {

    const updateTooltip = (e:MouseEvent) => {
      if(svgRef && pathRef && textRef && svgRef.current && pathRef.current && textRef.current) {
        const svgRect = svgRef.current.getBoundingClientRect()
        const textRect = textRef.current.getBoundingClientRect()

         const isLeft = ((e.x - svgRect.x) > (svgRect.width / 2))
         const isTop = ((e.y - svgRect.y) > (svgRect.height / 2))

        const w = textRect.width + 20
        const h = textRect.height + 20
        const x = (isLeft) ? e.x - svgRect.x + 8 - w : e.x - svgRect.x - 8
        const y = (isTop) ? e.y - svgRect.y - 12 - h : e.y - svgRect.y + 8

        setTooltipRect({ x: x, y: y, w: w, h: h, isLeft: isLeft, isTop: isTop })
      }
    }

    if (pathRef && pathRef.current) {
      pathRef.current.addEventListener('mouseover', () => { setHidden(false) })
      pathRef.current.addEventListener('mouseleave', () => { setHidden(true) })
      pathRef.current.addEventListener('mousemove', (e) => { if (!hidden) updateTooltip(e) })
    }
  }, [pathRef, svgRef, textRef, hidden])

  // build up tip of tooltip
  const bottomRight = (tooltipRect.x + 7).toString() + "," + (tooltipRect.y - 10).toString() + " " + (tooltipRect.x + 30).toString() + "," + tooltipRect.y.toString() + " " + (tooltipRect.x + 22).toString() + "," + tooltipRect.y.toString()
  const bottomLeft = (tooltipRect.x + tooltipRect.w - 8).toString() + "," + (tooltipRect.y - 10).toString() + " " + (tooltipRect.x + tooltipRect.w - 25).toString() + "," + tooltipRect.y.toString() + " " + (tooltipRect.x + tooltipRect.w - 15).toString() + "," + tooltipRect.y.toString()
  const topRight = (tooltipRect.x + 7).toString() + "," + (tooltipRect.y + tooltipRect.h + 10).toString() + " " + (tooltipRect.x + 15).toString() + "," + (tooltipRect.y + tooltipRect.h).toString() + " " + (tooltipRect.x + 7).toString() + "," + (tooltipRect.y +tooltipRect.h).toString()
  const topLeft = (tooltipRect.x + tooltipRect.w - 7).toString() + "," + (tooltipRect.y + tooltipRect.h + 10).toString() + " " + (tooltipRect.x + tooltipRect.w - 15).toString() + "," + (tooltipRect.y +tooltipRect.h).toString() + " " + (tooltipRect.x + tooltipRect.w - 7).toString() + "," + (tooltipRect.y + tooltipRect.h).toString()
  const points = (tooltipRect.isLeft && tooltipRect.isTop) ? topLeft : (tooltipRect.isTop) ? topRight : (tooltipRect.isLeft) ? bottomLeft : bottomRight 

  //Add multiline compatability
  const findSpaceBeforeThreshold = (inputString: string, threshold: number) => {
    var i = 0
    var temp = -1
    if(inputString.length <= threshold) { return ["", inputString]}
    while(i <= inputString.length && i <= threshold) {
      if(inputString[i] === " ") {
        temp = i
      }
      i++
    }
    return [inputString.slice(0, temp), inputString.slice(temp + 1)]
  }
  const tips :string[]=[]
  const startTip = findSpaceBeforeThreshold(props.tip, 35 - (1 * fontSize - 11))
  tips.push(startTip[0])
  var interimTip = startTip[1] 
  var leftover = startTip[1]
  while(interimTip !== "") {
    const currTip = findSpaceBeforeThreshold(interimTip === leftover ? interimTip : leftover, 35 - (1 * fontSize - 11))
    interimTip = currTip[0]
    leftover = currTip[1]
    tips.push(interimTip === "" ? currTip[1]: currTip[0])
  }

  // render everything
  return (
    <g pointerEvents={"none"}>
      <rect x={tooltipRect.x} y={tooltipRect.y} width={tooltipRect.w} rx={5} ry={5} height={tooltipRect.h} fill={bgColor} visibility={(hidden ? "hidden" : "visible")} />
      <polygon fill={bgColor} visibility={(hidden ? "hidden" : "visible")} points={points} />
        <text ref={textRef} x={tooltipRect.x + 10} cursor={"default"} y={tooltipRect.y} fontFamily={fontFamily} fontSize={fontSize} fill={textColor} visibility={(hidden ? "hidden" : "visible")}>
            {props.tip.length > 35 - (1*(fontSize - 11)) ? tips.map((tip, index)=> {
              return <tspan key={tip} x={tooltipRect.x+ 10} y={tooltipRect.y + (20 + (1 * fontSize - 11)) + (20 * (index))}>{tip}</tspan>
            }): <tspan x={tooltipRect.x+ 10} y={tooltipRect.y + (20 + (1 * fontSize - 11))}>{props.tip}</tspan>}
        </text>
    </g>
  )
}
