from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="freesend",
    version="1.0.0",
    author="Freesend Team",
    author_email="team@freesend.metafog.io",
    description="Official Python SDK for the Freesend email API",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/mokshablr/Freesend",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Topic :: Communications :: Email",
        "Topic :: Software Development :: Libraries :: Python Modules",
    ],
    python_requires=">=3.7",
    install_requires=[
        "requests>=2.25.0",
    ],
    extras_require={
        "dev": [
            "pytest>=6.0.0",
            "pytest-asyncio>=0.18.0",
            "black>=21.0.0",
            "flake8>=3.8.0",
            "mypy>=0.800",
        ],
    },
    keywords="freesend, email, api, smtp, python",
    project_urls={
        "Bug Reports": "https://github.com/mokshablr/Freesend/issues",
        "Source": "https://github.com/mokshablr/Freesend",
        "Documentation": "https://freesend.metafog.io/docs",
    },
) 