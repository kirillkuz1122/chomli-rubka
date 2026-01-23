import re
import os


def parse_css(content):
    # Remove duplicates of media queries and merge them
    # Strategy: find all @media blocks, extract them, merge by condition, append to end.

    # Simple tokenizer helpers
    def skip_comments(text, i):
        if text.startswith("/*", i):
            end = text.find("*/", i + 2)
            if end != -1:
                return end + 2
        return i

    # Find media blocks
    media_blocks = []  # list of {condition, content, start, end}

    i = 0
    length = len(content)

    while i < length:
        # Skip comments
        next_i = skip_comments(content, i)
        if next_i != i:
            i = next_i
            continue

        if content.startswith("@media", i):
            start = i
            # Find open brace
            open_brace = content.find("{", i)
            if open_brace == -1:
                break  # Should not happen in valid css

            condition = content[i + 6 : open_brace].strip()

            # Find matching close brace
            brace_count = 1
            j = open_brace + 1

            while j < length and brace_count > 0:
                # Skip comments inside
                next_j = skip_comments(content, j)
                if next_j != j:
                    j = next_j
                    continue

                char = content[j]
                if char == "{":
                    brace_count += 1
                elif char == "}":
                    brace_count -= 1
                j += 1

            if brace_count == 0:
                body = content[open_brace + 1 : j - 1]  # Content inside braces
                media_blocks.append(
                    {"condition": condition, "body": body, "start": start, "end": j}
                )
                i = j
                continue

        i += 1

    return media_blocks


def refactor_css(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    media_blocks = parse_css(content)

    if not media_blocks:
        print("No media queries found.")
        return

    # Group by condition
    grouped = {}
    for block in media_blocks:
        cond = block["condition"]
        if cond not in grouped:
            grouped[cond] = []
        grouped[cond].append(block["body"])

    # Reconstruct file
    # We remove the blocks from the original content using indices
    # We must do it from end to start to preserve indices

    # Sort blocks by start index descending
    media_blocks.sort(key=lambda x: x["start"], reverse=True)

    new_content = list(content)

    for block in media_blocks:
        # replace with empty string or comment
        # We'll just remove it effectively, but maybe leave a newline to avoid concatenating words
        start, end = block["start"], block["end"]
        # Replace the range with nothing
        new_content[start:end] = []

    final_str = "".join(new_content)

    # Clean up multiple newlines that might result
    final_str = re.sub(r"\n{3,}", "\n\n", final_str)

    # Append merged media queries
    final_str += "\n\n/* ========================================= */\n"
    final_str += "/*      CONSOLIDATED MEDIA QUERIES         */\n"
    final_str += "/* ========================================= */\n"

    # Check for specific "666px" equivalent or general ordering?
    # User said "media at 666pk" (likely 666px or similar custom one) - I should just preserve all I found.
    # It is good practice to sort media queries (e.g. descending width), but preserving discovery order is safer for logic.
    # I will iterate grouped in keys order... dict preserves insertion order in modern python (3.7+)

    for cond, bodies in grouped.items():
        merged_body = "\n".join(bodies)
        # Clean up body newlines
        merged_body = re.sub(r"\n{3,}", "\n\n", merged_body)

        final_str += f"\n@media {cond} {{\n{merged_body}\n}}"

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(final_str)

    print(
        f"Processed {len(media_blocks)} media blocks into {len(grouped)} unique queries."
    )


if __name__ == "__main__":
    refactor_css(r"c:\programming\проэкт мясорубка чомли\css\styles.css")
