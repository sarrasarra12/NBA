# test_mistral_local.py
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig, pipeline

MODEL_PATH = "nouvelair-mistral-finetuned"

print("Chargement modele...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)

# ← BitsAndBytesConfig séparé
bnb_config = BitsAndBytesConfig(
    load_in_4bit              = True,
    bnb_4bit_compute_dtype    = torch.float16,
    bnb_4bit_use_double_quant = True,
    bnb_4bit_quant_type       = "nf4"
)

model = AutoModelForCausalLM.from_pretrained(
    MODEL_PATH,
    quantization_config = bnb_config,   # ← ici !
    low_cpu_mem_usage   = True,
)

pipe = pipeline(
    "text-generation",
    model             = model,
    tokenizer         = tokenizer,
    max_new_tokens    = 200,
    temperature       = 0.3,
    repetition_penalty= 1.3,
    do_sample         = True,
    return_full_text  = False
)

print("Modele charge ! Test...")

prompt = """### Reclamation: Mon vol BJ509 du 16/03/2026 a ete annule sans preavis.
### Categorie: annulation
### Reponse:"""

result = pipe(prompt)
print(result[0]['generated_text'])