import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate
from book.styles import BookCanvas, get_book_styles, chapter_page_map
from book.frontmatter import build_frontmatter
from book.part1 import build_part1
from book.part2 import build_part2
from book.part3 import build_part3
from book.code_walkthroughs import build_code_walkthroughs
from book.migrations_deepdive import build_migrations_deepdive
from book.part4 import build_part4
from book.postmortems import build_postmortems
from book.part5 import build_part5
from book.deep_essays import (
    build_part1_addon,
    build_part2_addon_ch3b,
    build_part2_addon_ch5b,
    build_part3_addon_ch10c,
    build_part4_addon_ch17c
)
from book.final_addons import (
    build_part3_addon_ch9c,
    build_part4_addon_ch15c
)

def assemble_story(styles, toc_page_numbers=None):
    story = []
    story.extend(build_frontmatter(styles, toc_page_numbers))
    
    # Part I: Genesis & Tenets
    story.extend(build_part1(styles))
    story.extend(build_part1_addon(styles))
    
    # Part II: Chronicles of Iteration
    story.extend(build_part2(styles))
    story.extend(build_part2_addon_ch3b(styles))
    story.extend(build_part2_addon_ch5b(styles))
    
    # Part III: Deep Technical Architecture
    story.extend(build_part3(styles))
    story.extend(build_code_walkthroughs(styles))
    story.extend(build_part3_addon_ch9c(styles))
    story.extend(build_part3_addon_ch10c(styles))
    story.extend(build_migrations_deepdive(styles))
    
    # Part IV: Operator's Playbook
    story.extend(build_part4(styles))
    story.extend(build_part4_addon_ch15c(styles))
    story.extend(build_part4_addon_ch17c(styles))
    story.extend(build_postmortems(styles))
    
    # Part V: Appendices & Colophon
    story.extend(build_part5(styles))
    return story

def build_book(output_path="KeywordsNews_Developer_Handbook.pdf"):
    styles = get_book_styles()
    
    print("--- PASS 1: Measuring Exact Chapter Page Numbers ---")
    dummy_path = "temp_pass1.pdf"
    doc_dummy = SimpleDocTemplate(
        dummy_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    story_pass1 = assemble_story(styles, toc_page_numbers={})
    doc_dummy.build(story_pass1, canvasmaker=BookCanvas)
    
    measured_pages = dict(chapter_page_map)
    print("Measured Page Map:", measured_pages)
    if os.path.exists(dummy_path):
        os.remove(dummy_path)
        
    print("--- PASS 2: Compiling Final Production Book with Dynamic TOC ---")
    doc_final = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    story_pass2 = assemble_story(styles, toc_page_numbers=measured_pages)
    doc_final.build(story_pass2, canvasmaker=BookCanvas)
    
    # Verify page count
    with open(output_path, 'rb') as f:
        import re
        total_pages = len(re.findall(rb'/Type\s*/Page\b', f.read()))
        
    print(f"\n🎉 Master Book compiled successfully: {output_path}")
    print(f"📊 Total Page Count: {total_pages} pages")
    return total_pages

if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else "KeywordsNews_Developer_Handbook.pdf"
    build_book(out)
