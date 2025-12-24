package database

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"strings"

	"github.com/creativeprojects/go-selfupdate"
)

type UpdateInfo struct {
	CurrentVersion string `json:"currentVersion"`
	LatestVersion  string `json:"latestVersion"`
	ReleaseNotes   string `json:"releaseNotes"`
	URL            string `json:"url"`
	HasUpdate      bool   `json:"hasUpdate"`
}

type Updater struct {
	ctx context.Context
}

func NewUpdater() *Updater {
	return &Updater{}
}

func (u *Updater) SetContext(ctx context.Context) {
	u.ctx = ctx
}

func (u *Updater) CheckForUpdate(currentVersion string) (*UpdateInfo, error) {
	slug := selfupdate.ParseSlug("parevo-lab/mergen")

	updater, err := selfupdate.NewUpdater(selfupdate.Config{
		Filters:       []string{"^mergen_"},
		UniversalArch: "universal",
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create updater: %w", err)
	}

	latest, found, err := updater.DetectLatest(context.Background(), slug)
	if err != nil {
		return nil, fmt.Errorf("failed to detect latest version: %w", err)
	}

	if !found {
		return &UpdateInfo{
			CurrentVersion: currentVersion,
			HasUpdate:      false,
		}, nil
	}

	// Strip 'v' prefix for semantic comparison
	cleanCurrentVersion := strings.TrimPrefix(currentVersion, "v")
	hasUpdate := latest.GreaterThan(cleanCurrentVersion)

	return &UpdateInfo{
		CurrentVersion: currentVersion,
		LatestVersion:  latest.Version(),
		ReleaseNotes:   latest.ReleaseNotes,
		URL:            latest.URL,
		HasUpdate:      hasUpdate,
	}, nil
}

func (u *Updater) ApplyUpdate(latestVersion string) error {
	slug := selfupdate.ParseSlug("parevo-lab/mergen")

	updater, err := selfupdate.NewUpdater(selfupdate.Config{
		Filters:       []string{"^mergen_"},
		UniversalArch: "universal",
	})
	if err != nil {
		return err
	}

	latest, found, err := updater.DetectLatest(context.Background(), slug)
	if err != nil || !found {
		return fmt.Errorf("could not find latest release")
	}

	self, err := os.Executable()
	if err != nil {
		return err
	}

	// Internal progress tracker
	// In a more advanced version, we could use a custom progress writer
	// and emit Wails events to the frontend.

	err = updater.UpdateTo(context.Background(), latest, self)
	if err != nil {
		return fmt.Errorf("failed to apply update: %w", err)
	}

	return nil
}

// RestartApp attempts to restart the application after update
func (u *Updater) RestartApp() error {
	self, err := os.Executable()
	if err != nil {
		return err
	}

	cmd := exec.Command(self)
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	err = cmd.Start()
	if err != nil {
		return err
	}

	os.Exit(0)
	return nil
}
