.PHONY: release dev build

# Usage: make release v=v0.0.5
release:
	@if [ -z "$(v)" ]; then echo "Version is required. Usage: make release v=v0.0.5"; exit 1; fi
	git tag $(v)
	git push origin $(v)

dev:
	~/go/bin/wails dev

build:
	~/go/bin/wails build
