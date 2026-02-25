"""
Build Engine module for IntentBridge.

Generates boilerplate code and project scaffolding automatically from
execution plans. Capable of producing starter files for the recommended
technology stack.
"""
from backend.modules.base import AIModule
from jinja2 import Template
import json

class BuildEngine(AIModule):
    async def process(self, plan: dict) -> dict:
        self.logger.info("Starting multi-stage build generation")
        
        # 1. Architecture Generation
        arch_prompt = Template(self.load_prompt("build_arch.txt")).render(plan=json.dumps(plan))
        architecture = await self._generate_structured_json(arch_prompt)
        
        # 2. Backend Generation
        backend_prompt = Template(self.load_prompt("build_backend.txt")).render(plan=json.dumps(plan))
        backend_code = await self._generate_structured_json(backend_prompt)
        
        # 3. Frontend Generation
        frontend_prompt = Template(self.load_prompt("build_frontend.txt")).render(plan=json.dumps(plan))
        frontend_code = await self._generate_structured_json(frontend_prompt)
        
        results = {
            "architecture": architecture,
            "backend": backend_code,
            "frontend": frontend_code
        }
        return results
