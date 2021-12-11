import { Runtime, Inspector } from "https://cdn.jsdelivr.net/npm/@observablehq/runtime@4/dist/runtime.js";
import define from "https://api.observablehq.com/d/c7fe3ba4f568bdc9.js?v=3";
new Runtime().module(define, name => {
    if (name === "chart") return new Inspector(document.querySelector("#observablehq-chart-96e916e8"));
});

import cdc_define from "https://api.observablehq.com/d/541c1454d475aa9b.js?v=3";
new Runtime().module(cdc_define, name => {
    if (name === "chart") return new Inspector(document.querySelector("#observablehq-chart-9614742a"));
});

import define_wc from "https://api.observablehq.com/d/c5ed13cfdb7003f5.js?v=3";
new Runtime().module(define_wc, name => {
    if (name === "sdechart")
        return new Inspector(document.querySelector("#observablehq-sdechart-68b9e8b9"));
    else if (name === "dschart")
        return new Inspector(document.querySelector("#observablehq-dschart-68b9e8b9"));
    else if (name === "eechart")
        return new Inspector(document.querySelector("#observablehq-eechart-68b9e8b9"));
    else if (name === "financechart")
        return new Inspector(document.querySelector("#observablehq-financechart-68b9e8b9"));
    else if (name === "pmchart")
        return new Inspector(document.querySelector("#observablehq-pmchart-68b9e8b9"));
    else if (name === "clerkchart")
        return new Inspector(document.querySelector("#observablehq-clerkchart-68b9e8b9"));
    else if (name === "cschart")
        return new Inspector(document.querySelector("#observablehq-cschart-68b9e8b9"));
});