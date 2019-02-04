const WIDTH = 400
const HEIGHT = 400

const nameSearch = function() {
    let searchTerm = document.getElementById('searchTerm').value
    let result = Object.keys(PPL_DATA).find(key => PPL_DATA[key].name.toLowerCase() === searchTerm.toLowerCase())
    if (result === undefined) alert('no record found')
    else {
        startD3(parseInt(result))
    }
}

const startD3 = function(id) {
    document.getElementById('curr_node').innerHTML = `${PPL_DATA[id].name} (${id})`
    document.getElementById('next_node_title').innerHTML = 'N/A'
    document.getElementById('next_node_button_container').innerHTML = ''
    id = parseInt(id)
    let links = REL_DATA.filter(link =>  link.per_1_id === id || link.per_2_id === id)
                        .map(link => {
                            if (link.per_1_id === id) {
                                return {'source': link.per_1_id, 'target': link.per_2_id}
                            } else if (link.per_2_id === id) {
                                return {'source': link.per_2_id, 'target': link.per_1_id}
                            }
                        })
    let nodes = links.map(link => ({'id': link.target, 'name': `${PPL_DATA[link.target].name} (${link.target})`}))
    nodes.push({'id': id, 'name': `${PPL_DATA[id].name} (${id})`})

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(WIDTH / 2, HEIGHT / 2))

    const svg = d3.select('body').select('svg')
    svg.selectAll('g').remove()

    const link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .enter().append("line")

    const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("r", 5)
        .call(drag(simulation))
        .on("click", function(d) {
            node.attr('fill', 'black')
            d3.select(this).attr('fill', 'red')
            handleNodeClick(id, d.id)
        })

    node.append("title")
        .text(d => d.name);

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });


}

const handleNodeClick = function(ogID, id) {
    if (ogID === id) {
        document.getElementById('next_node_title').innerHTML = 'N/A'
        document.getElementById('next_node_button_container').innerHTML = ''
    } else {
        document.getElementById('next_node_title').innerHTML = `${PPL_DATA[id].name} (${id})`
        document.getElementById('next_node_button_container').innerHTML = `<button onclick="startD3('${id}')">Go to ${PPL_DATA[id].name} (${id})'s page</button>`
    }
}

const drag = simulation => {

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}
