from backend.modules.base import AIModule
from jinja2 import Template
import json

class BuildEngine(AIModule):
    async def process(self, plan: dict) -> dict:
        prompt_template = self.load_prompt("build_engine.txt")
        prompt = Template(prompt_template).render(
            plan=json.dumps(plan)
        )
        # Build engine might need a larger model or more tokens
        return await self._generate_structured_json(prompt)
