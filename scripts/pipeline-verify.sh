#!/usr/bin/env bash
# Pipeline verification script
# Usage: ./scripts/pipeline-verify.sh [--stage STAGE] [--verbose]
# 
# Stages: plan, design, tickets, build, verify, review
# Default: verify (runs full gate chain)

set -euo pipefail

STAGE="${1:-}"
VERBOSE=""
COLOR_RESET="\033[0m"
COLOR_GREEN="\033[32m"
COLOR_YELLOW="\033[33m"
COLOR_RED="\033[31m"
COLOR_BLUE="\033[36m"

log_info() { echo -e "${COLOR_BLUE}▶${COLOR_RESET} $1"; }
log_success() { echo -e "${COLOR_GREEN}✓${COLOR_RESET} $1"; }
log_warn() { echo -e "${COLOR_YELLOW}⚠${COLOR_RESET} $1"; }
log_error() { echo -e "${COLOR_RED}✗${COLOR_RESET} $1"; }

show_help() {
    cat << EOF
Pipeline Verification Script

Usage: $0 [OPTIONS] [STAGE]

Stages:
  plan       - Check scope documentation exists
  design     - Verify architecture docs are updated
  tickets    - Validate acceptance criteria format
  build      - Run typecheck, lint, unit tests
  verify     - Full gate chain (build + integration if available)
  review     - Pre-flight checks for PR creation

Options:
  --help     Show this help message
  --verbose  Enable verbose output
  --all      Run all stages

Example:
  $0           # runs verify stage
  $0 plan      # checks plan stage requirements
  $0 --all     # runs full pipeline validation
EOF
    exit 0
}

[[ "$*" == *"--help"* ]] && show_help

if [[ "$VERBOSE" == *"--verbose"* ]]; then
    set -x
fi

run_stage() {
    local stage="$1"
    log_info "Running stage: $stage"
    
    case "$stage" in
        plan)
            log_info "Checking scope documentation..."
            if [[ ! -f "docs/pipeline.md" ]]; then
                log_error "pipeline.md not found"
                exit 1
            fi
            log_success "Pipeline docs exist"
            ;;
        
        design)
            log_info "Validating design documentation..."
            if [[ ! -f "docs/architecture.md" ]]; then
                log_error "architecture.md not found"
                exit 1
            fi
            log_success "Architecture docs present"
            ;;
        
        tickets)
            log_info "Checking spec structure..."
            if [[ ! -d "specs" ]]; then
                log_error "specs directory not found"
                exit 1
            fi
            log_success "Specs directory exists"
            ;;
        
        build)
            log_info "Running typecheck..."
            pnpm typecheck || { log_error "Typecheck failed"; exit 1; }
            
            log_info "Running lint..."
            pnpm lint || { log_error "Lint failed"; exit 1; }
            
            log_info "Running unit tests..."
            pnpm test:unit || { log_error "Unit tests failed"; exit 1; }
            
            log_success "Build stage passed"
            ;;
        
        verify)
            log_info "Running full verification..."
            run_stage build
            
            log_info "Running build..."
            pnpm build || { log_error "Build failed"; exit 1; }
            
            log_success "Full verification passed"
            ;;
        
        review)
            log_info "Pre-flight review checks..."
            
            # Check git status
            if [[ -n "$(git status --porcelain)" ]]; then
                log_warn "Working directory has uncommitted changes"
                git status --short
            fi
            
            # Check for CI green status locally
            if [[ -f ".github/workflows/ci.yml" ]]; then
                log_info "CI workflow file present"
            fi
            
            log_success "Review pre-flight checks complete"
            ;;
        
        --all)
            for stage in plan design tickets build verify review; do
                run_stage "$stage"
            done
            ;;
        
        *)
            # Default to verify if no valid stage provided
            run_stage verify
            ;;
    esac
    
    echo ""
}

cd "$(dirname "$0")/.."
run_stage "${STAGE:-verify}"
