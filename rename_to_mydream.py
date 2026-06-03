import re

html_path = r"c:\Users\hp\Desktop\GOPI\index.html"
api_path = r"c:\Users\hp\Desktop\GOPI\api\enroll.js"

# 1. Update index.html
print("Renaming brand in index.html...")
with open(html_path, "r", encoding="utf-8") as f:
    html_content = f.read()

# Replace document title and meta authors
html_content = html_content.replace(
    "<title>Nexus AI Academy | Premium Data Science, Data Analyst & Generative AI Training</title>",
    "<title>MyDream | Premium Corporate Training, Data Science, Analyst & Generative AI</title>"
)
html_content = html_content.replace(
    '<meta name="author" content="Nexus AI Academy">',
    '<meta name="author" content="MyDream">'
)
html_content = html_content.replace(
    '<meta property="og:title" content="Nexus AI Academy | Industry-Focused Data & AI Certification">',
    '<meta property="og:title" content="MyDream | Corporate Training, Data & AI Certification">'
)

# Replace Header Logo with MyDream + Corporate Training sub-heading
old_header_logo = """            <a href="#" class="logo" id="header-logo">
                <span class="logo-icon"><i class="fa-solid fa-microchip"></i></span>
                <span class="logo-text">Nexus<span class="gradient-text">AI</span></span>
            </a>"""

new_header_logo = """            <a href="#" class="logo" id="header-logo" style="display: flex; flex-direction: column; align-items: flex-start; line-height: 1;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span class="logo-icon"><i class="fa-solid fa-microchip"></i></span>
                    <span class="logo-text">MyDream</span>
                </div>
                <span style="font-size: 0.6rem; font-weight: 700; letter-spacing: 1.5px; color: var(--secondary-cyan); margin-left: 36px; text-transform: uppercase; margin-top: 2px;">Corporate Training</span>
            </a>"""

html_content = html_content.replace(old_header_logo, new_header_logo)

# Replace Footer Logo with MyDream + Corporate Training sub-heading
old_footer_logo = """            <div class="footer-brand">
                <a href="#" class="logo">
                    <span class="logo-icon"><i class="fa-solid fa-microchip"></i></span>
                    <span class="logo-text">Nexus<span class="gradient-text">AI</span></span>
                </a>"""

new_footer_logo = """            <div class="footer-brand">
                <a href="#" class="logo" style="display: flex; flex-direction: column; align-items: flex-start; line-height: 1; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span class="logo-icon"><i class="fa-solid fa-microchip"></i></span>
                        <span class="logo-text">MyDream</span>
                    </div>
                    <span style="font-size: 0.6rem; font-weight: 700; letter-spacing: 1.5px; color: var(--secondary-cyan); margin-left: 36px; text-transform: uppercase; margin-top: 2px;">Corporate Training</span>
                </a>"""

html_content = html_content.replace(old_footer_logo, new_footer_logo)

# General text replacements in html
html_content = html_content.replace("Nexus AI Academy", "MyDream Academy")
html_content = html_content.replace("Nexus AI Alumnus", "MyDream Alumnus")
html_content = html_content.replace("Nexus AI Campus", "MyDream Campus")
html_content = html_content.replace("Nexus Placement Ecosystem", "MyDream Placement Ecosystem")
html_content = html_content.replace("Why Professionals Choose Nexus AI", "Why Professionals Choose MyDream")
html_content = html_content.replace("Nexus Digital AI Labs", "MyDream Corporate Training Labs")
html_content = html_content.replace("&copy; 2026 Nexus AI Academy", "&copy; 2026 MyDream Academy")

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)
print("index.html updated.")


# 2. Update api/enroll.js
print("Renaming brand in api/enroll.js...")
with open(api_path, "r", encoding="utf-8") as f:
    api_content = f.read()

api_content = api_content.replace("Nexus AI Academy", "MyDream Academy")
api_content = api_content.replace("Nexus AI Academy Admissions", "MyDream Academy Admissions")
api_content = api_content.replace("Welcome to Nexus AI Academy", "Welcome to MyDream Academy")
api_content = api_content.replace("welcome to *Nexus AI Academy*", "welcome to *MyDream Academy*")
api_content = api_content.replace("Welcome to *Nexus AI Academy*", "Welcome to *MyDream Academy*")

with open(api_path, "w", encoding="utf-8") as f:
    f.write(api_content)
print("api/enroll.js updated.")
