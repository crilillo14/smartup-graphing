import { openai } from "@/app/openai";

export const runtime = "nodejs";

// Create a new assistant
export async function POST() {
  const assistant = await openai.beta.assistants.create({
    instructions: "You are a helpful assistant that can create graphs and visualizations when asked. When users ask for graphs, use the create_graph function to generate them.",
    name: "Graph Assistant",
    model: "gpt-4",
    tools: [
      { type: "code_interpreter" },
      {
        type: "function",
        function: {
          name: "create_graph",
          description: "Create a graph visualization with the provided data",
          parameters: {
            type: "object",
            properties: {
              type: {
                type: "string",
                description: "The type of chart (e.g., 'line', 'bar')",
                enum: ["line", "bar"]
              },
              title: {
                type: "string",
                description: "The title of the graph"
              },
              labels: {
                type: "array",
                items: { type: "string" },
                description: "Labels for the x-axis"
              },
              datasets: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    label: {
                      type: "string",
                      description: "Label for this dataset"
                    },
                    data: {
                      type: "array",
                      items: { type: "number" },
                      description: "Data points for this dataset"
                    },
                    borderColor: {
                      type: "string",
                      description: "Color for line graphs"
                    },
                    backgroundColor: {
                      type: "string",
                      description: "Background color for bar graphs"
                    }
                  },
                  required: ["label", "data"]
                },
                description: "Array of datasets to plot"
              }
            },
            required: ["type", "labels", "datasets"]
          }
        }
      }
    ]
  });
  return Response.json({ assistantId: assistant.id });
}
